import time
import requests
import subprocess
import os

print("Starting uvicorn server...")
server = subprocess.Popen([".venv/Scripts/python.exe", "-m", "uvicorn", "backend.main:app", "--port", "8000"])

for _ in range(15):
    try:
        r = requests.get("http://127.0.0.1:8000/health")
        if r.status_code == 200:
            break
    except:
        pass
    time.sleep(1)

print("\n--- Live API Tests ---")
try:
    print("\n1. GET /health")
    r = requests.get("http://127.0.0.1:8000/health")
    print(f"Status: {r.status_code}")
    
    print("\n2. POST /api/v1/analyze/sms (Normal)")
    r = requests.post("http://127.0.0.1:8000/api/v1/analyze/sms", json={"message": "Can we meet at 6pm?"})
    d = r.json()
    print(f"Status: {r.status_code}, Verdict: {d.get('verdict')}, Score: {d.get('risk_score')}, Explainability: {'Yes' if 'explainability' in d else 'No'}")
    
    print("\n3. POST /api/v1/analyze/sms (Suspicious)")
    r = requests.post("http://127.0.0.1:8000/api/v1/analyze/sms", json={"message": "URGENT! Verify your OTP now or your account will be suspended."})
    d = r.json()
    print(f"Status: {r.status_code}, Verdict: {d.get('verdict')}, Score: {d.get('risk_score')}, Explainability: {'Yes' if 'explainability' in d else 'No'}")
    
    print("\n4. POST /api/v1/analyze/url (Phishing)")
    r = requests.post("http://127.0.0.1:8000/api/v1/analyze/url", json={"url": "http://paypa1-secure-login.top/signin/verify"})
    d = r.json()
    print(f"Status: {r.status_code}, Verdict: {d.get('verdict')}, Score: {d.get('risk_score')}, Explainability: {'Yes' if 'explainability' in d else 'No'}")

finally:
    print("\nKilling server...")
    server.terminate()
    server.wait()
