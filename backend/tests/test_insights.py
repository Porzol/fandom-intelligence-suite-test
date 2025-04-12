import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ai_insight import AIInsight, TargetType
from app.api.endpoints.auth import get_password_hash, create_access_token
from app.models.user import User, UserRole
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
def test_insight(test_db):
    db = TestingSessionLocal()
    insight = AIInsight(
        target_type=TargetType.FAN,
        target_id=1,
        summary="Test insight summary",
        details="Test insight details with more information",
        tags=["test", "fan", "high-value"],
        confidence_score=0.85,
        action_items=["Action 1", "Action 2"],
        metadata={"test_key": "test_value"}
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    insight_id = insight.id
    db.close()
    
    return insight_id

def test_get_insights(test_db, admin_token):
    response = client.get(
        "/api/insights/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_insight_by_id(test_db, admin_token, test_insight):
    response = client.get(
        f"/api/insights/{test_insight}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_insight
    assert data["summary"] == "Test insight summary"
    assert data["target_type"] == "FAN"
    assert data["confidence_score"] == 0.85

def test_create_insight(test_db, admin_token):
    new_insight = {
        "target_type": "CREATOR",
        "target_id": 2,
        "summary": "New test insight",
        "details": "Detailed information about the test insight",
        "tags": ["test", "creator"],
        "confidence_score": 0.75,
        "action_items": ["Action 1", "Action 2"],
        "metadata": {"source": "test"}
    }
    
    response = client.post(
        "/api/insights/",
        json=new_insight,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"] == "New test insight"
    assert data["target_type"] == "CREATOR"
    assert data["confidence_score"] == 0.75

def test_update_insight(test_db, admin_token, test_insight):
    update_data = {
        "summary": "Updated summary",
        "confidence_score": 0.9
    }
    
    response = client.put(
        f"/api/insights/{test_insight}",
        json=update_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_insight
    assert data["summary"] == "Updated summary"
    assert data["confidence_score"] == 0.9
    # Other fields should remain unchanged
    assert data["target_type"] == "FAN"

def test_archive_insight(test_db, admin_token, test_insight):
    response = client.post(
        f"/api/insights/archive/{test_insight}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_insight
    assert data["is_archived"] == True

def test_unarchive_insight(test_db, admin_token, test_insight):
    # First archive it
    client.post(
        f"/api/insights/archive/{test_insight}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Then unarchive it
    response = client.post(
        f"/api/insights/unarchive/{test_insight}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_insight
    assert data["is_archived"] == False

def test_generate_insight(test_db, admin_token):
    generate_request = {
        "target_type": "GENERAL",
        "custom_prompt": "Test prompt for general insights"
    }
    
    response = client.post(
        "/api/insights/generate",
        json=generate_request,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "processing"
    assert "message" in data

def test_delete_insight(test_db, admin_token, test_insight):
    response = client.delete(
        f"/api/insights/{test_insight}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(
        f"/api/insights/{test_insight}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 404
