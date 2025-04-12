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

def test_simulate_conversation(test_db, admin_token):
    simulation_request = {
        "fan_type": "high_value",
        "initial_message": "Hey, I saw your latest post and I'm interested in more content like that",
        "scenario": "purchase_intent"
    }
    
    response = client.post(
        "/api/simulate/conversation",
        json=simulation_request,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "conversation_id" in data
    assert "messages" in data
    assert len(data["messages"]) > 0
    
    return data["conversation_id"]

def test_get_simulation_scenarios(test_db, admin_token):
    response = client.get(
        "/api/simulate/scenarios",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check for common scenarios
    scenario_types = [scenario["type"] for scenario in data]
    assert "purchase_intent" in scenario_types
    assert "complaint" in scenario_types
    assert "general_inquiry" in scenario_types

def test_get_fan_types(test_db, admin_token):
    response = client.get(
        "/api/simulate/fan-types",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check for common fan types
    fan_types = [fan_type["id"] for fan_type in data]
    assert "high_value" in fan_types
    assert "new_subscriber" in fan_types
    assert "inactive" in fan_types

def test_continue_simulation(test_db, admin_token):
    # First create a simulation
    conversation_id = test_simulate_conversation(test_db, admin_token)
    
    continue_request = {
        "message": "Yes, I'd definitely be interested in a premium package"
    }
    
    response = client.post(
        f"/api/simulate/conversation/{conversation_id}/continue",
        json=continue_request,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == conversation_id
    assert "messages" in data
    assert len(data["messages"]) > 1  # Should have original + new messages

def test_get_simulation_history(test_db, admin_token):
    # First create a simulation
    conversation_id = test_simulate_conversation(test_db, admin_token)
    
    response = client.get(
        "/api/simulate/history",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(conv["id"] == conversation_id for conv in data)

def test_get_simulation_by_id(test_db, admin_token):
    # First create a simulation
    conversation_id = test_simulate_conversation(test_db, admin_token)
    
    response = client.get(
        f"/api/simulate/conversation/{conversation_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == conversation_id
    assert "messages" in data
    assert len(data["messages"]) > 0

def test_rate_simulation_response(test_db, admin_token):
    # First create a simulation
    conversation_id = test_simulate_conversation(test_db, admin_token)
    
    # Get the first response message ID
    response = client.get(
        f"/api/simulate/conversation/{conversation_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    messages = response.json()["messages"]
    response_message_id = next(msg["id"] for msg in messages if not msg["is_from_fan"])
    
    rating_request = {
        "rating": 4,
        "feedback": "Good response, but could be more personalized"
    }
    
    response = client.post(
        f"/api/simulate/message/{response_message_id}/rate",
        json=rating_request,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message_id"] == response_message_id
    assert data["rating"] == 4
