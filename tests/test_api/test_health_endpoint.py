"""
NOTE: requires fastapi + httpx installed. Run via `pytest tests/` in a
normal environment: `pip install -r requirements.txt -r requirements-dev.txt`
"""
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "AI Digital Safety" in response.json()["app"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert "status" in body
    assert "models_loaded" in body
