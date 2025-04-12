import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.api.endpoints.auth import get_password_hash, create_access_token
from main import app
from tests.test_auth import override_get_db, TestingSessionLocal, test_db

client = TestClient(app)

@pytest.fixture
def admin_token(test_db):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.username == "testuser").first()
    db.close()
    
    access_token = create_access_token(data={"sub": user.username})
    return access_token

def test_generate_test_scenario(test_db, admin_token):
    test_scenario = {
        "name": "High-value fan response test",
        "description": "Testing response strategies for high-spending fans",
        "variants": [
            {
                "name": "Variant A",
                "content": "Thank you for your support! Would you like to see our exclusive content?",
                "is_control": True
            },
            {
                "name": "Variant B",
                "content": "We appreciate your loyalty! As one of our top fans, you get early access to our premium content.",
                "is_control": False
            }
        ],
        "target_segment": "high_value",
        "success_metric": "conversion_rate"
    }
    
    response = client.post(
        "/api/test/scenarios",
        json=test_scenario,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "High-value fan response test"
    assert len(data["variants"]) == 2
    
    return data["id"]

def test_get_test_scenarios(test_db, admin_token):
    # First create a test scenario
    scenario_id = test_generate_test_scenario(test_db, admin_token)
    
    response = client.get(
        "/api/test/scenarios",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(scenario["id"] == scenario_id for scenario in data)

def test_get_test_scenario_by_id(test_db, admin_token):
    # First create a test scenario
    scenario_id = test_generate_test_scenario(test_db, admin_token)
    
    response = client.get(
        f"/api/test/scenarios/{scenario_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == scenario_id
    assert data["name"] == "High-value fan response test"
    assert len(data["variants"]) == 2

def test_start_test(test_db, admin_token):
    # First create a test scenario
    scenario_id = test_generate_test_scenario(test_db, admin_token)
    
    response = client.post(
        f"/api/test/scenarios/{scenario_id}/start",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == scenario_id
    assert data["status"] == "running"

def test_stop_test(test_db, admin_token):
    # First create and start a test scenario
    scenario_id = test_generate_test_scenario(test_db, admin_token)
    client.post(
        f"/api/test/scenarios/{scenario_id}/start",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    response = client.post(
        f"/api/test/scenarios/{scenario_id}/stop",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == scenario_id
    assert data["status"] == "completed"

def test_get_test_results(test_db, admin_token):
    # First create and start a test scenario
    scenario_id = test_generate_test_scenario(test_db, admin_token)
    client.post(
        f"/api/test/scenarios/{scenario_id}/start",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Add some test results
    test_result = {
        "scenario_id": scenario_id,
        "variant_id": 1,  # Assuming the first variant has ID 1
        "metrics": {
            "impressions": 100,
            "conversions": 15,
            "conversion_rate": 0.15
        }
    }
    
    client.post(
        "/api/test/results",
        json=test_result,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    response = client.get(
        f"/api/test/scenarios/{scenario_id}/results",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == scenario_id
    assert "variants" in data
    assert len(data["variants"]) > 0
    assert "metrics" in data["variants"][0]
    assert "conversion_rate" in data["variants"][0]["metrics"]
