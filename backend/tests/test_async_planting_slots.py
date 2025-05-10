import pytest
from httpx import AsyncClient
import asyncio

from src.models.terrain import Terrain
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.main import app

pytestmark = pytest.mark.asyncio

@pytest.fixture(scope="module")
def test_async_data():
    # Store test data between tests
    return {}

async def test_create_planting_in_valid_slot_async(test_async_data):
    """Test creating a planting in a valid slot using async API"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. Create a player
        player_data = {"name": "Async Planting Test Player", "balance": 100.0}
        player_response = await client.post("/players/", json=player_data)
        assert player_response.status_code == 200
        player = player_response.json()
        test_async_data["player_id"] = player["id"]
        
        # 2. Create a terrain for this player
        terrain_data = {
            "player_id": player["id"],
            "name": "Async Planting Test Terrain",
            "x_coordinate": 3.0,
            "y_coordinate": 3.0,
            "access_type": "public"
        }
        
        terrain_response = await client.post("/async/terrains/", json=terrain_data)
        assert terrain_response.status_code == 200
        terrain = terrain_response.json()
        test_async_data["terrain_id"] = terrain["id"]
        
        # 3. Get the quadrants for this terrain
        quadrants_response = await client.get(f"/async/quadrants/?terrain_id={terrain['id']}")
        assert quadrants_response.status_code == 200
        quadrants = quadrants_response.json()
        assert len(quadrants) == 15  # Should have 15 quadrants
        
        test_async_data["quadrant_id"] = quadrants[0]["id"]  # Use the first quadrant
        
        # 4. Create a planting in slot 1
        planting_data = {
            "player_id": player["id"],
            "species_id": 1,  # Assuming species ID 1 exists
            "quadrant_id": test_async_data["quadrant_id"],
            "slot_index": 1
        }
        
        planting_response = await client.post("/async/plantings/", json=planting_data)
        assert planting_response.status_code == 200
        planting = planting_response.json()
        
        # Verify the planting data
        assert planting["player_id"] == player["id"]
        assert planting["species_id"] == 1
        assert planting["quadrant_id"] == test_async_data["quadrant_id"]
        assert planting["slot_index"] == 1
        
        # 5. Create another planting in the same quadrant but different slot (slot 2)
        planting_data2 = {
            "player_id": player["id"],
            "species_id": 1,
            "quadrant_id": test_async_data["quadrant_id"],
            "slot_index": 2
        }
        
        planting_response2 = await client.post("/async/plantings/", json=planting_data2)
        assert planting_response2.status_code == 200
        planting2 = planting_response2.json()
        
        assert planting2["slot_index"] == 2
        test_async_data["planting_id"] = planting["id"]
        test_async_data["planting2_id"] = planting2["id"]

async def test_duplicate_slot_fails_async(test_async_data):
    """Test that creating a planting in an occupied slot fails using async API"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Try to create a planting in the same slot as an existing one
        planting_data = {
            "player_id": test_async_data["player_id"],
            "species_id": 1,
            "quadrant_id": test_async_data["quadrant_id"],
            "slot_index": 1  # This slot is already occupied by the first test
        }
        
        # This should fail with a 400 Bad Request
        response = await client.post("/async/plantings/", json=planting_data)
        assert response.status_code == 400
        error_detail = response.json()["detail"]
        assert "already occupied" in error_detail

async def test_get_plantings_by_quadrant_async(test_async_data):
    """Test retrieving plantings for a specific quadrant using async API"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Get plantings for the quadrant
        response = await client.get(f"/async/plantings/?quadrant_id={test_async_data['quadrant_id']}")
        assert response.status_code == 200
        plantings = response.json()
        
        # Should have 2 plantings (slot 1 and slot 2)
        assert len(plantings) == 2
        
        # Verify both plantings are included
        planting_ids = [p["id"] for p in plantings]
        assert test_async_data["planting_id"] in planting_ids
        assert test_async_data["planting2_id"] in planting_ids
        
        # Verify slot indexes are correct
        slot_indexes = [p["slot_index"] for p in plantings]
        assert 1 in slot_indexes
        assert 2 in slot_indexes
