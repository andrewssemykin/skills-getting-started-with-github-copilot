import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) > 0

def test_signup_and_remove_participant():
    # Pick an activity
    activity_name = list(client.get("/activities").json().keys())[0]
    email = "testuser@mergington.edu"

    # Sign up
    resp_signup = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert resp_signup.status_code == 200
    assert "Signed up" in resp_signup.json()["message"]

    # Double sign up should fail
    resp_signup2 = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert resp_signup2.status_code == 400
    assert "already signed up" in resp_signup2.json()["detail"]

    # Remove participant
    resp_remove = client.delete(f"/activities/{activity_name}/signup?email={email}")
    assert resp_remove.status_code == 200
    assert "Removed" in resp_remove.json()["message"]

    # Remove again should fail
    resp_remove2 = client.delete(f"/activities/{activity_name}/signup?email={email}")
    assert resp_remove2.status_code == 404
    assert "Participant not found" in resp_remove2.json()["detail"]
