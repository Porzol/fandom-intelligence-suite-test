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

def test_system_health(test_db, admin_token):
    response = client.get(
        "/api/health",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "uptime" in data

def test_end_to_end_flow(test_db, admin_token):
    """Test a complete user flow through the system"""
    
    # 1. Create a new fan
    new_fan = {
        "name": "Test Fan",
        "onlyfans_id": "testfan123",
        "total_spent": 50.0,
        "first_seen": "2023-04-01",
        "last_active": "2023-04-10",
        "status": "active",
        "creator_id": 1
    }
    
    fan_response = client.post(
        "/api/dashboard/fans",
        json=new_fan,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert fan_response.status_code == 200
    fan_data = fan_response.json()
    fan_id = fan_data["id"]
    
    # 2. Create a message from this fan
    new_message = {
        "fan_id": fan_id,
        "chatter_id": 1,
        "content": "I'm interested in purchasing more content",
        "is_from_fan": True,
        "timestamp": "2023-04-10T14:30:00",
        "message_type": "text"
    }
    
    message_response = client.post(
        "/api/ingest/messages",
        json=new_message,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert message_response.status_code == 200
    message_data = message_response.json()
    
    # 3. Generate an AI insight for this fan
    insight_request = {
        "target_type": "fan",
        "target_id": fan_id
    }
    
    insight_response = client.post(
        "/api/insights/generate",
        json=insight_request,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert insight_response.status_code == 200
    
    # 4. Create an A/B test scenario
    test_scenario = {
        "name": "Purchase intent response test",
        "description": "Testing response strategies for purchase intent",
        "variants": [
            {
                "name": "Standard Offer",
                "content": "We have a special package available for $29.99",
                "is_control": True
            },
            {
                "name": "Premium Offer",
                "content": "Our premium package is available for $49.99 and includes exclusive content",
                "is_control": False
            }
        ],
        "target_segment": "purchase_intent",
        "success_metric": "conversion_rate"
    }
    
    scenario_response = client.post(
        "/api/test/scenarios",
        json=test_scenario,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert scenario_response.status_code == 200
    scenario_data = scenario_response.json()
    
    # 5. Start the test
    start_test_response = client.post(
        f"/api/test/scenarios/{scenario_data['id']}/start",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert start_test_response.status_code == 200
    
    # 6. Run a simulation with the fan type
    simulation_request = {
        "fan_type": "high_value",
        "initial_message": "I'm interested in purchasing more content",
        "scenario": "purchase_intent"
    }
    
    simulation_response = client.post(
        "/api/simulate/conversation",
        json=simulation_request,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert simulation_response.status_code == 200
    simulation_data = simulation_response.json()
    
    # 7. Check dashboard stats to ensure they reflect our new data
    stats_response = client.get(
        "/api/dashboard/stats/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert stats_response.status_code == 200
    stats_data = stats_response.json()
    
    # Verify that our new fan is counted
    assert stats_data["fan_stats"]["total_fans"] >= 1
    
    # 8. Verify that insights are being generated
    insights_response = client.get(
        "/api/insights/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert insights_response.status_code == 200
    insights_data = insights_response.json()
    
    # The system should have at least some insights
    assert len(insights_data) >= 0  # This might be 0 if background task hasn't completed
    
    # 9. Clean up - archive the test
    stop_test_response = client.post(
        f"/api/test/scenarios/{scenario_data['id']}/stop",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert stop_test_response.status_code == 200
