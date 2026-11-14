from fastapi.testclient import TestClient
from app.main import app, GRIEVANCES

client = TestClient(app)

def setup_function():
    GRIEVANCES.clear()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_categories_include_six_domains():
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert len([x for x in response.json() if x["id"] != "needs_review"]) == 6

def test_create_grievance_and_generate_draft():
    response = client.post("/api/v1/grievances", json={
        "description": "Garbage has not been collected from our street for seven days",
        "location": "Ward 4, Patna, Bihar", "language": "English", "consent": True
    })
    assert response.status_code == 201
    body = response.json()
    assert body["classification"]["category_id"] == "sanitation"
    assert "Subject:" in body["complaint_draft"]
    assert body["status"] == "Draft - not submitted to government"

def test_followup_is_citizen_recorded():
    created = client.post("/api/v1/grievances", json={"description": "My pension payment has not arrived for two months", "location": "Patna, Bihar"}).json()
    response = client.post(f"/api/v1/grievances/{created['id']}/followups", json={"note": "I called the local office today", "reference_number": "LOCAL-123"})
    assert response.status_code == 201
    assert response.json()["source"] == "citizen_recorded"

def test_unknown_grievance_returns_404():
    assert client.get("/api/v1/grievances/not-a-real-id").status_code == 404
