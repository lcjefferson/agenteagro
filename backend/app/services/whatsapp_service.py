from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models import Conversation, Message
from app.models.professional import Professional
from app.models.system_config import SystemConfig
from app.services.ai_service import analyze_text, analyze_image
import logging
import re
import httpx
import base64
import io
from pypdf import PdfReader

logger = logging.getLogger(__name__)

async def get_system_config(db: AsyncSession, key: str):
    result = await db.execute(select(SystemConfig).filter(SystemConfig.key == key))
    config = result.scalars().first()
    return config.value if config else None

async def download_media(media_id: str, access_token: str) -> bytes:
    """Download media from WhatsApp API"""
    async with httpx.AsyncClient() as client:
        # 1. Get Media URL
        try:
            url_response = await client.get(
                f"https://graph.facebook.com/v17.0/{media_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if url_response.status_code != 200:
                logger.error(f"Error getting media URL: {url_response.text}")
                return None
                
            data = url_response.json()
            media_url = data.get("url")
            if not media_url:
                return None
                
            # 2. Download Media
            media_response = await client.get(
                media_url,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if media_response.status_code != 200:
                logger.error(f"Error downloading media: {media_response.text}")
                return None
                
            return media_response.content
        except Exception as e:
            logger.error(f"Exception downloading media: {e}")
            return None

def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes"""
    try:
        reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            text += (page.extract_text() or "") + "\n"
        return text
    except Exception as e:
        logger.error(f"Error reading PDF: {e}")
        return "Erro ao ler PDF."

async def send_whatsapp_message(db: AsyncSession, to: str, text: str):
    """
    Send message to WhatsApp API using credentials from DB.
    """
    try:
        token = await get_system_config(db, "whatsapp_access_token")
        number_id = await get_system_config(db, "whatsapp_number_id")
        
        if not token or not number_id:
            logger.error("WhatsApp credentials not found in database.")
            return

        url = f"https://graph.facebook.com/v17.0/{number_id}/messages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": text}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"WhatsApp API Error: {response.text}")
            else:
                logger.info(f"Message sent to {to}")
                
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {e}")

BRAZIL_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

async def extract_and_update_state(db: AsyncSession, conversation: Conversation, text: str):
    """
    Extract state and problem category from text and update conversation.
    """
    if not text: return conversation.location_state
    
    text_upper = text.upper()
    text_lower = text.lower()
    
    # 1. Extract State
    found_state = None
    # Check for 2-letter codes
    words = re.findall(r'\b[A-Z]{2}\b', text_upper)
    for w in words:
        if w in BRAZIL_STATES:
            found_state = w
            break
            
    # 2. Extract Problem Category
    found_category = None
    categories = {
        'Praga': ['praga', 'inseto', 'lagarta', 'bicho', 'mosca', 'pulgão'],
        'Doença': ['doença', 'fungo', 'bactéria', 'virus', 'vírus', 'ferrugem', 'mancha'],
        'Clima': ['clima', 'chuva', 'seca', 'sol', 'geada', 'granizo', 'tempo'],
        'Nutrição': ['nutrição', 'adubo', 'fertilizante', 'calcário', 'deficiência', 'amarelando'],
        'Plantio': ['plantio', 'semear', 'semeadura', 'espaçamento', 'semente'],
        'Colheita': ['colheita', 'colher', 'produção', 'produtividade', 'safra']
    }
    
    for cat, keywords in categories.items():
        if any(k in text_lower for k in keywords):
            found_category = cat
            break
            
    # Update DB if changes found
    changed = False
    if found_state and conversation.location_state != found_state:
        conversation.location_state = found_state
        changed = True
        
    if found_category and conversation.problem_category != found_category:
        conversation.problem_category = found_category
        changed = True
        
    if changed:
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return found_state
    
    return conversation.location_state

async def get_relevant_professionals(db: AsyncSession, state: str, text: str):
    """
    Search for professionals based on state and keywords in text.
    """
    text_lower = text.lower() if text else ""
    
    # Determine type based on keywords
    prof_type = None
    if any(k in text_lower for k in ["veterinário", "veterinario", "animal", "boi", "vaca"]):
        prof_type = "Veterinário"
    elif any(k in text_lower for k in ["agrônomo", "agronomo", "planta", "lavoura", "soja", "milho"]):
        prof_type = "Agrônomo"
    
    query = select(Professional)
    
    if state:
        query = query.filter(Professional.state == state)
        
    if prof_type:
        query = query.filter(Professional.type == prof_type)
    
    # Limit to 3 suggestions
    query = query.limit(3)
    result = await db.execute(query)
    return result.scalars().all()

async def process_whatsapp_message(db: AsyncSession, message_data: dict):
    """
    Process incoming WhatsApp message.
    """
    try:
        wa_id = message_data.get("from")
        msg_type = message_data.get("type")
        
        if not wa_id:
            return

        # Find or create conversation
        result = await db.execute(select(Conversation).filter(Conversation.whatsapp_id == wa_id))
        conversation = result.scalars().first()
        
        if not conversation:
            conversation = Conversation(whatsapp_id=wa_id)
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)

        # Extract content
        msg_body = None
        media_id = None
        media_type = None
        caption = None

        if msg_type == "text":
            msg_body = message_data.get("text", {}).get("body")
        elif msg_type == "image":
            image_data = message_data.get("image", {})
            media_id = image_data.get("id")
            caption = image_data.get("caption")
            media_type = "image"
            msg_body = caption or "[Imagem]"
        elif msg_type == "document":
            doc_data = message_data.get("document", {})
            media_id = doc_data.get("id")
            caption = doc_data.get("caption")
            media_type = "document"
            msg_body = caption or f"[Documento: {doc_data.get('filename')}]"
        else:
            msg_body = f"[{msg_type} não suportado]"

        # Log User Message
        user_msg = Message(
            conversation_id=conversation.id,
            content=msg_body,
            role="user",
            media_url=media_id
        )
        db.add(user_msg)
        await db.commit()

        # Generate Response
        response_text = ""
        openai_key = await get_system_config(db, "openai_api_key")
        whatsapp_token = await get_system_config(db, "whatsapp_access_token")

        # Try to extract state/category from any available text
        text_to_analyze = msg_body
        if msg_type == "document":
             # We'll update this later after extracting doc text
             pass
        else:
             current_state = await extract_and_update_state(db, conversation, text_to_analyze)

        if msg_type == "text":
            # 2. Check for professionals if state is known or implied
            context_info = ""
            if "contato" in msg_body.lower() or "ajuda" in msg_body.lower() or "preciso" in msg_body.lower() or "procurar" in msg_body.lower():
                professionals = await get_relevant_professionals(db, conversation.location_state, msg_body)
                if professionals:
                    prof_list = "\n".join([f"- {p.name} ({p.type}), {p.city}-{p.state}. Tel: {p.phone or 'N/A'}" for p in professionals])
                    context_info = f"\n\nCONTEXTO: Encontrei estes profissionais que podem ajudar o usuário. Se apropriado, sugira-os:\n{prof_list}"
            elif not conversation.location_state and ("onde" in msg_body.lower() or "região" in msg_body.lower() or "cidade" in msg_body.lower()):
                 context_info = "\n\nCONTEXTO: Ainda não sei a região (Estado/UF) do usuário. Pergunte educadamente onde ele está para indicarmos profissionais próximos."

            response_text = await analyze_text(msg_body, context=context_info, api_key=openai_key)

        elif msg_type == "image" and media_id:
            if not whatsapp_token:
                response_text = "Erro: Token do WhatsApp não configurado no sistema."
            else:
                media_content = await download_media(media_id, whatsapp_token)
                if media_content:
                    b64_img = base64.b64encode(media_content).decode('utf-8')
                    # Pass caption as context if available (not currently supported in analyze_image but logic is self-contained there for now)
                    # Actually analyze_image takes base64. We can update prompt inside analyze_image or just use generic one.
                    # For better UX, let's just call analyze_image.
                    response_text = await analyze_image(b64_img, api_key=openai_key)
                else:
                    response_text = "Não consegui baixar a imagem do WhatsApp."

        elif msg_type == "document" and media_id:
            if not whatsapp_token:
                response_text = "Erro: Token do WhatsApp não configurado no sistema."
            else:
                media_content = await download_media(media_id, whatsapp_token)
                if media_content:
                    # Check if PDF
                    mime_type = message_data.get("document", {}).get("mime_type", "")
                    doc_text = ""
                    if "pdf" in mime_type:
                        doc_text = extract_text_from_pdf(media_content)
                    else:
                        # Try decoding as text
                        try:
                            doc_text = media_content.decode('utf-8')
                        except:
                            doc_text = "[Conteúdo binário não suportado para leitura direta]"
                    
                    # Update state/category from doc text
                    await extract_and_update_state(db, conversation, doc_text[:1000] + (caption or ""))

                    prompt = f"Analise este documento.\n\nConteúdo extraído:\n{doc_text[:4000]}" # Limit to 4000 chars
                    if caption:
                        prompt += f"\n\nLegenda/Instrução do usuário: {caption}"
                    
                    response_text = await analyze_text(prompt, api_key=openai_key)
                else:
                    response_text = "Não consegui baixar o documento."

        
        else:
            response_text = "Desculpe, ainda não sei processar este tipo de mensagem."

        # Log Assistant Message
        assistant_msg = Message(
            conversation_id=conversation.id,
            content=response_text,
            role="assistant"
        )
        db.add(assistant_msg)
        await db.commit()

        # Send response back to WhatsApp
        await send_whatsapp_message(db, wa_id, response_text)

    except Exception as e:
        logger.error(f"Error processing message: {e}")
