import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.message import Message
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

@pytest.fixture
def test_messages(test_db):
    db = TestingSessionLocal()
    
    # Create test messages
    messages = [
        Message(
            fan_id=1,
            chatter_id=1,
            content="Hey, I really liked your latest post!",
            is_from_fan=True,
            timestamp="2023-04-01T12:30:00",
            message_type="text"
        ),
        Message(
            fan_id=1,
            chatter_id=1,
            content="Thank you! I'm glad you enjoyed it. Would you like to see more exclusive content?",
            is_from_fan=False,
            timestamp="2023-04-01T12:35:00",
            message_type="text"
        ),
        Message(
            fan_id=2,
            chatter_id=2,
            content="Do you have any special offers right now?",
            is_from_fan=True,
            timestamp="2023-04-02T14:20:00",
            message_type="text"
        )
    ]
    
    for message in messages:
        db.add(message)
    
    db.commit()
    
    message_ids = [message.id for message in messages]
    db.close()
    
    return message_ids

def test_get_messages(test_db, admin_token, test_messages):
    response = client.get(
        "/api/ingest/messages",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3  # At least our test messages

def test_get_message_by_id(test_db, admin_token, test_messages):
    message_id = test_messages[0]
    response = client.get(
        f"/api/ingest/messages/{message_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == message_id
    assert data["content"] == "Hey, I really liked your latest post!"
    assert data["is_from_fan"] == True

def test_get_conversation(test_db, admin_token, test_messages):
    response = client.get(
        "/api/ingest/conversations/1",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # At least our test messages for fan_id 1
    assert all(message["fan_id"] == 1 for message in data)

def test_create_message(test_db, admin_token):
    new_message = {
        "fan_id": 2,
        "chatter_id": 1,
        "content": "Here's a special discount just for you!",
        "is_from_fan": False,
        "timestamp": "2023-04-02T15:00:00",
        "message_type": "text"
    }
    
    response = client.post(
        "/api/ingest/messages",
        json=new_message,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Here's a special discount just for you!"
    assert data["fan_id"] == 2
    assert data["chatter_id"] == 1
    assert data["is_from_fan"] == False

def test_upload_message_batch(test_db, admin_token):
    message_batch = {
        "messages": [
            {
                "fan_id": 3,
                "chatter_id": 2,
                "content": "Hello, I'm new here!",
                "is_from_fan": True,
                "timestamp": "2023-04-03T10:00:00",
                "message_type": "text"
            },
            {
                "fan_id": 3,
                "chatter_id": 2,
                "content": "Welcome! Let me show you around.",
                "is_from_fan": False,
                "timestamp": "2023-04-03T10:05:00",
                "message_type": "text"
            }
        ]
    }
    
    response = client.post(
        "/api/ingest/batch",
        json=message_batch,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert data["count"] == 2

def test_get_message_stats(test_db, admin_token, test_messages):
    response = client.get(
        "/api/dashboard/stats/messages",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_messages" in data
    assert "fan_messages" in data
    assert "chatter_messages" in data
    assert data["total_messages"] >= 3  # At least our test messages
