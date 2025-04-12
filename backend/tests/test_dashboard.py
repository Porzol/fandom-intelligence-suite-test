import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.fan import Fan
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
def test_fans(test_db):
    db = TestingSessionLocal()
    
    # Create test fans
    fans = [
        Fan(
            name="John Doe",
            onlyfans_id="john123",
            total_spent=150.50,
            first_seen="2023-01-15",
            last_active="2023-04-10",
            status="active",
            creator_id=1
        ),
        Fan(
            name="Jane Smith",
            onlyfans_id="jane456",
            total_spent=75.25,
            first_seen="2023-02-20",
            last_active="2023-04-05",
            status="active",
            creator_id=1
        ),
        Fan(
            name="Bob Johnson",
            onlyfans_id="bob789",
            total_spent=200.00,
            first_seen="2023-01-05",
            last_active="2023-03-15",
            status="inactive",
            creator_id=2
        )
    ]
    
    for fan in fans:
        db.add(fan)
    
    db.commit()
    
    fan_ids = [fan.id for fan in fans]
    db.close()
    
    return fan_ids

def test_get_fans(test_db, admin_token, test_fans):
    response = client.get(
        "/api/dashboard/fans",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3  # At least our test fans

def test_get_fan_by_id(test_db, admin_token, test_fans):
    fan_id = test_fans[0]
    response = client.get(
        f"/api/dashboard/fans/{fan_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == fan_id
    assert data["name"] == "John Doe"
    assert data["onlyfans_id"] == "john123"
    assert data["total_spent"] == 150.50

def test_get_fan_stats(test_db, admin_token, test_fans):
    response = client.get(
        "/api/dashboard/stats/fans",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_fans" in data
    assert "active_fans" in data
    assert "average_spent" in data
    assert data["total_fans"] >= 3  # At least our test fans
    assert data["active_fans"] >= 2  # At least our active test fans

def test_get_top_fans(test_db, admin_token, test_fans):
    response = client.get(
        "/api/dashboard/fans/top",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # The top fan should be Bob Johnson with $200
    assert any(fan["name"] == "Bob Johnson" for fan in data)
    
    # Test with limit parameter
    response = client.get(
        "/api/dashboard/fans/top?limit=1",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

def test_get_fans_by_status(test_db, admin_token, test_fans):
    # Test active fans
    response = client.get(
        "/api/dashboard/fans?status=active",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert all(fan["status"] == "active" for fan in data)
    assert len(data) >= 2  # At least our active test fans
    
    # Test inactive fans
    response = client.get(
        "/api/dashboard/fans?status=inactive",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert all(fan["status"] == "inactive" for fan in data)
    assert len(data) >= 1  # At least our inactive test fan

def test_get_fans_by_creator(test_db, admin_token, test_fans):
    response = client.get(
        "/api/dashboard/fans?creator_id=1",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert all(fan["creator_id"] == 1 for fan in data)
    assert len(data) >= 2  # At least our test fans for creator 1
