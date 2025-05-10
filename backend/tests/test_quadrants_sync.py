import pytest

@pytest.fixture(scope="module")
def test_quadrant_data():
    # Store data between tests
    return {}

def test_create_terrain_generates_quadrants(client, test_quadrant_data):
    # Create a player first
    player_data = {"name": "Terrain Test Player", "balance": 100.0}
    player_response = client.post("/players/", json=player_data)
    assert player_response.status_code == 200
    player = player_response.json()
    test_quadrant_data["player_id"] = player["id"]
    
    # Create a terrain for this player
    terrain_data = {
        "player_id": player["id"],
        "name": "Test Terrain",
        "x_coordinate": 1.0,
        "y_coordinate": 1.0,
        "access_type": "public"
    }
    
    # Create the terrain (should auto-generate quadrants)
    terrain_response = client.post("/terrains/", json=terrain_data)
    assert terrain_response.status_code == 200
    terrain = terrain_response.json()
    test_quadrant_data["terrain_id"] = terrain["id"]
    
    # Query the API to get quadrants for this terrain
    response = client.get(f"/quadrants/?terrain_id={terrain['id']}")
    
    # Verify the response
    assert response.status_code == 200
    quadrants = response.json()
    
    # Check that exactly 15 quadrants were created
    assert len(quadrants) == 15
    
    # Check that all expected labels are present
    expected_labels = [f"{row}{col}" for row in ["A", "B", "C"] for col in ["1", "2", "3", "4", "5"]]
    actual_labels = [q["label"] for q in quadrants]
    
    # Sort both lists to ensure proper comparison
    expected_labels.sort()
    actual_labels.sort()
    
    assert actual_labels == expected_labels
    
    # Verify that each quadrant has the correct terrain_id
    for quadrant in quadrants:
        assert quadrant["terrain_id"] == terrain["id"]
