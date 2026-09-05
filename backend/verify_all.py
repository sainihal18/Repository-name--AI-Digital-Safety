import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    errors = []
    
    print("--- STARTING FULL PLATFORM AUDIT ---")
    
    # 1. Health
    print("Checking /health...", end=" ")
    r = client.get("/api/v1/health")
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code})")
        errors.append("Health endpoint failed")

    # 2. SMS Analysis
    print("Checking /analyze/sms...", end=" ")
    r = client.post("/api/v1/analyze/sms", json={"message": "URGENT your account has been locked. Click here to verify."})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("SMS Analysis failed")

    # 3. URL Analysis
    print("Checking /analyze/url...", end=" ")
    r = client.post("/api/v1/analyze/url", json={"url": "http://secure-paypal-update.xyz/login"})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("URL Analysis failed")

    # 4. Image Analysis (Mock failure is fine, we just want to ensure it doesn't 500)
    print("Checking /analyze/image...", end=" ")
    with open(__file__, "rb") as f:
        r = client.post("/api/v1/analyze/image", files={"file": ("test.py", f, "text/plain")})
    # We expect a 400 because it's not an image, but not a 500.
    if r.status_code in [200, 400]:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Image Analysis failed")

    # 5. Password Checker
    print("Checking /analyze/password...", end=" ")
    r = client.post("/api/v1/analyze/password", json={"password": "TestPassword123!"})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Password Analysis failed")

    # 6. Port Scanner
    print("Checking /scan/ports...", end=" ")
    r = client.post("/api/v1/scan/ports", json={"target": "127.0.0.1", "ports": [80, 443]})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Port Scanner failed")

    # 7. Vault
    print("Checking /vault/store...", end=" ")
    r = client.post("/api/v1/vault/store", json={"ciphertext": "abc", "iv": "123", "salt": "456", "label": "test"})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Vault Store failed")

    # 8. Email Forensics
    print("Checking /analyze/email...", end=" ")
    r = client.post("/api/v1/analyze/email", json={"raw_email": "From: test@example.com\nTo: you@example.com\nSubject: Hello\n\nBody"})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Email Forensics failed")

    # 9. QR Scanner
    print("Checking /analyze/qr...", end=" ")
    with open(__file__, "rb") as f:
        r = client.post("/api/v1/analyze/qr", files={"file": ("test.py", f, "text/plain")})
    if r.status_code in [200, 400]:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("QR Scanner failed")

    # 10. Dark Web Monitor
    print("Checking /monitor/darkweb...", end=" ")
    r = client.post("/api/v1/monitor/darkweb", json={"email": "test@example.com"})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Dark Web Monitor failed")

    # 11. Cyber Copilot
    print("Checking /copilot/chat...", end=" ")
    r = client.post("/api/v1/copilot/chat", json={"message": "hello", "history": []})
    if r.status_code == 200:
        print("OK")
    else:
        print(f"FAILED ({r.status_code}): {r.text}")
        errors.append("Copilot Chat failed")

    print("--- AUDIT COMPLETE ---")
    if not errors:
        print("RESULT: ALL SYSTEMS NOMINAL. 0 ERRORS.")
        sys.exit(0)
    else:
        print(f"RESULT: {len(errors)} ERRORS DETECTED.")
        for e in errors:
            print(f"- {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
