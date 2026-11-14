import pytest
from fastapi.testclient import TestClient
from app import main

@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "test.db")
    main.reset_store()
    with TestClient(main.app) as test_client:
        yield test_client
    main.reset_store()

def test_health_reports_sqlite(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["storage"] == "sqlite"

def test_categories_include_six_domains(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert len([x for x in response.json() if x["id"] != "needs_review"]) == 6

@pytest.mark.parametrize(("description", "expected"), [
    ("Garbage has not been collected from our street for seven days", "sanitation"),
    ("My pension payment has not arrived for two months", "welfare"),
    ("There are dangerous potholes on our road", "infrastructure"),
    ("There has been no electricity supply since yesterday", "utilities"),
    ("The government hospital has no prescribed medicine", "healthcare"),
    ("My birth certificate application is delayed", "administration"),
    ("हमारी गली में कचरा जमा है और सफाई नहीं हुई", "sanitation"),
])
def test_classification_categories(client, description, expected):
    result = client.post("/api/v1/grievances", json={"description": description, "location": "Ward 4, Patna, Bihar", "consent": True})
    assert result.status_code == 201
    assert result.json()["classification"]["category_id"] == expected

def test_create_edit_and_read_persisted_grievance(client):
    created = client.post("/api/v1/grievances", json={
        "description": "Garbage has not been collected from our street for seven days",
        "location": "Ward 4, Patna, Bihar", "language": "English", "consent": True
    }).json()
    gid = created["id"]
    edited = "Subject: Please review the sanitation issue in Ward 4.\n\nUpdated complaint draft for review."
    assert client.patch(f"/api/v1/grievances/{gid}/complaint", json={"complaint_draft": edited}).status_code == 200
    fetched = client.get(f"/api/v1/grievances/{gid}").json()
    assert fetched["complaint_draft"] == edited
    assert len(client.get("/api/v1/grievances").json()) == 1

def test_followup_is_citizen_recorded_and_persisted(client):
    created = client.post("/api/v1/grievances", json={"description": "My pension payment has not arrived for two months", "location": "Patna, Bihar", "consent": True}).json()
    gid = created["id"]
    response = client.post(f"/api/v1/grievances/{gid}/followups", json={"note": "I called the local office today", "reference_number": "LOCAL-123"})
    assert response.status_code == 201
    assert response.json()["source"] == "citizen_recorded"
    assert client.get(f"/api/v1/grievances/{gid}").json()["followups"][0]["note"] == "I called the local office today"

def test_citizen_can_correct_classification(client):
    created = client.post("/api/v1/grievances", json={"description": "There is an issue with the public service", "location": "Patna", "consent": True}).json()
    response = client.patch(f"/api/v1/grievances/{created['id']}/classification", json={"category_id": "utilities"})
    assert response.status_code == 200
    assert response.json()["classification"]["confidence"] == "citizen-selected"

def test_unknown_grievance_returns_404(client):
    assert client.get("/api/v1/grievances/not-a-real-id").status_code == 404

def test_validation_rejects_short_description(client):
    assert client.post("/api/v1/grievances", json={"description": "short", "location": "Patna"}).status_code == 422

def test_consent_acknowledgement_is_required(client):
    response = client.post("/api/v1/grievances", json={"description": "Garbage collection has not happened", "location": "Patna"})
    assert response.status_code == 400

def test_delete_grievance_removes_record(client):
    created = client.post("/api/v1/grievances", json={"description": "Garbage collection has not happened", "location": "Patna", "consent": True}).json()
    gid = created["id"]
    assert client.delete(f"/api/v1/grievances/{gid}").status_code == 204
    assert client.get(f"/api/v1/grievances/{gid}").status_code == 404
