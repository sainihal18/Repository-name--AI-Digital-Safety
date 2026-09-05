"""NOTE: requires fastapi + httpx installed."""
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_analyze_sms_returns_full_report():
    response = client.post("/api/v1/analyze/sms", json={
        "message": "URGENT! Verify your OTP now at http://fake-bank-verify.top or your account will be suspended."
    })
    assert response.status_code == 200
    body = response.json()
    assert body["input_type"] == "SMS"
    assert "risk_score" in body
    assert "scam_dna" in body
    assert "attack_chain" in body


def test_analyze_sms_rejects_empty_message():
    response = client.post("/api/v1/analyze/sms", json={"message": ""})
    assert response.status_code in (422, 400)
