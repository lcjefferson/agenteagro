import pytest
from app.services.geo_service import find_nearby_professionals

@pytest.mark.asyncio
async def test_find_nearby_professionals():
    professionals = await find_nearby_professionals(-23.55, -46.63)
    assert len(professionals) > 0
    assert "name" in professionals[0]
    assert "distance" in professionals[0]
