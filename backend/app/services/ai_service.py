from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def analyze_text(text: str, context: str = "", api_key: str = None) -> str:
    """
    Analyze text using OpenAI GPT.
    """
    current_api_key = api_key or settings.OPENAI_API_KEY
    
    if not current_api_key:
        debug_msg = f"Simulated AI Response: OpenAI API Key not configured. [Context: {context}]"
        return debug_msg

    try:
        local_client = AsyncOpenAI(api_key=current_api_key)
        
        response = await local_client.chat.completions.create(
            model="gpt-4o", # Upgraded to 4o for better reasoning
            messages=[
                {"role": "system", "content": "Você é o AgenteAgro, um assistente especialista em agricultura e veterinária. Forneça conselhos práticos e técnicos. " + context},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return "Desculpe, estou com dificuldades para processar sua mensagem no momento."

async def analyze_image(base64_image: str, api_key: str = None) -> str:
    """
    Analyze image using OpenAI Vision.
    """
    current_api_key = api_key or settings.OPENAI_API_KEY
    
    if not current_api_key:
        return "Simulated Vision Response: OpenAI API Key not configured."

    try:
        local_client = AsyncOpenAI(api_key=current_api_key)
        
        response = await local_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Você é um especialista agrícola. Analise esta imagem detalhadamente. Se for uma planta ou animal, identifique possíveis doenças, pragas ou problemas nutricionais. Se for um documento, transcreva e resuma o conteúdo."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI Vision: {e}")
        return "Desculpe, não consegui analisar a imagem enviada."
