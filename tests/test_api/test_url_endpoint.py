"""NOTE: requires fastapi + httpx installed."""
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_analyze_url_returns_full_report():
    response = client.post("/api/v1/analyze/url", json={"url": "https://www.example.com"})
    assert response.status_code == 200
    body = response.json()
    assert body["input_type"] == "URL"
    assert "risk_score" in body
    assert "threat_intelligence" in body


def test_analyze_url_rejects_malformed_url():
    response = client.post("/api/v1/analyze/url", json={"url": "http://"})
    assert response.status_code in (422, 400)
