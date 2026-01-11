import asyncio
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.whatsapp_service import extract_and_update_state
from app.models.conversation import Conversation
from app.db.session import AsyncSessionLocal

async def test_extraction():
    # Mock conversation
    conv = Conversation(id=1, whatsapp_id="123")
    
    # Test cases
    test_cases = [
        ("Estou com uma praga na soja em MT", "MT", "Praga"),
        ("Meu gado está com doença no RS", "RS", "Doença"),
        ("Preciso de adubo para o milho", None, "Nutrição"),
        ("Quando devo iniciar a colheita?", None, "Colheita"),
        ("O clima está muito seco em SP", "SP", "Clima")
    ]
    
    print("Testing extraction logic...")
    
    # We can't easily mock the DB session for the actual update, 
    # but we can test the regex/logic if we copy it or just run it and see if it crashes.
    # Since extract_and_update_state takes a DB session, we need a real one or mock.
    # Let's just run it against the real DB (it won't save if we don't commit, but the function commits)
    # Actually, let's just create a dummy session mock to avoid DB writes during this quick test
    
    class MockSession:
        def add(self, obj): pass
        async def commit(self): pass
        async def refresh(self, obj): pass
        
    mock_db = MockSession()
    
    for text, expected_state, expected_cat in test_cases:
        conv.location_state = None
        conv.problem_category = None
        
        await extract_and_update_state(mock_db, conv, text)
        
        print(f"Text: '{text}'")
        print(f"  State: {conv.location_state} (Expected: {expected_state})")
        print(f"  Category: {conv.problem_category} (Expected: {expected_cat})")
        
        if conv.location_state != expected_state or conv.problem_category != expected_cat:
            print("  ❌ FAIL")
        else:
            print("  ✅ PASS")

if __name__ == "__main__":
    asyncio.run(test_extraction())
