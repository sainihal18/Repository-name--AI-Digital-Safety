import pytest
from backend.models.schemas import SMSAnalyzeRequest, URLAnalyzeRequest
from backend.api.v1.endpoints.sms import analyze_sms
from backend.api.v1.endpoints.url import analyze_url

# --------------------------------------------------------------------------
# SMS Test Cases
# --------------------------------------------------------------------------
SMS_TEST_CASES = [
    # Clean examples (Expect Safe/Low Risk)
    {"msg": "Hey mom, are you free for dinner tonight?", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 20},
    {"msg": "Your package has been delivered to your front porch.", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 30},
    {"msg": "Don't forget our meeting at 10 AM tomorrow.", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 20},
    {"msg": "Your appointment is confirmed for Tuesday at 3pm.", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 20},
    {"msg": "Can you pick up milk on your way home?", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 20},

    # Suspicious examples (Expect Suspicious/Medium Risk)
    {"msg": "Act now to claim your free gift from Amazon. Link here: bit.ly/freestuff", "expected_verdict": ["SUSPICIOUS", "HIGH RISK"], "min_score": 50, "max_score": 100},
    {"msg": "Your bank account has an unusual login attempt. Verify now.", "expected_verdict": ["SUSPICIOUS", "HIGH RISK"], "min_score": 60, "max_score": 100},
    {"msg": "Congratulations! You won the lottery. Send $500 for processing fee.", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 75, "max_score": 100},

    # High Risk Phishing (Expect High Risk/Critical)
    {"msg": "URGENT: Your PayPal account is restricted. Update your billing info immediately at http://paypal-update-info.com or your account will be closed.", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 85, "max_score": 100},
    {"msg": "Netflix: Payment declined. Please update your card details at http://netflix-billing-verify.net", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 85, "max_score": 100},
    {"msg": "IRS Alert: You have unpaid taxes. A warrant will be issued for your arrest unless you pay immediately via Bitcoin.", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 90, "max_score": 100},
    {"msg": "Do not share this OTP. The OTP is 849201 to approve a transaction of $1000.", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 70, "max_score": 100}, # Suspicious context
]

# --------------------------------------------------------------------------
# URL Test Cases
# --------------------------------------------------------------------------
URL_TEST_CASES = [
    # Safe URLs
    {"url": "https://www.google.com", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 20},
    {"url": "https://github.com/microsoft/vscode", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 20},
    {"url": "https://en.wikipedia.org/wiki/Phishing", "expected_verdict": ["SAFE", "LOW RISK"], "min_score": 0, "max_score": 30},

    # High Risk URLs
    {"url": "http://paypal-secure-update.com/login", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 80, "max_score": 100},
    {"url": "https://apple-id-verify.top/secure", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 80, "max_score": 100},
    {"url": "http://192.168.1.100/malware.exe", "expected_verdict": ["HIGH RISK", "CRITICAL"], "min_score": 80, "max_score": 100},
    {"url": "http://bit.ly/random-scam-link-123", "expected_verdict": ["SUSPICIOUS", "HIGH RISK", "CRITICAL"], "min_score": 50, "max_score": 100},
]


@pytest.mark.asyncio
async def test_sms_accuracy_battery():
    """Run an extensive battery of SMS tests to ensure model robustness and calibration."""
    failures = []
    
    for idx, test_case in enumerate(SMS_TEST_CASES):
        req = SMSAnalyzeRequest(message=test_case["msg"])
        report = await analyze_sms(req)
        
        valid_verdict = report.verdict in test_case["expected_verdict"]
        valid_score = test_case["min_score"] <= report.risk_score <= test_case["max_score"]
        
        if not (valid_verdict and valid_score):
            failures.append({
                "test_id": idx,
                "message": test_case["msg"],
                "expected_verdicts": test_case["expected_verdict"],
                "actual_verdict": report.verdict,
                "expected_score_range": f"{test_case['min_score']}-{test_case['max_score']}",
                "actual_score": report.risk_score
            })
            
    assert len(failures) == 0, f"Failed {len(failures)} SMS tests: {failures}"


@pytest.mark.asyncio
async def test_url_accuracy_battery():
    """Run an extensive battery of URL tests to ensure model robustness and calibration."""
    failures = []
    
    for idx, test_case in enumerate(URL_TEST_CASES):
        req = URLAnalyzeRequest(url=test_case["url"])
        report = await analyze_url(req)
        
        valid_verdict = report.verdict in test_case["expected_verdict"]
        valid_score = test_case["min_score"] <= report.risk_score <= test_case["max_score"]
        
        if not (valid_verdict and valid_score):
            failures.append({
                "test_id": idx,
                "url": test_case["url"],
                "expected_verdicts": test_case["expected_verdict"],
                "actual_verdict": report.verdict,
                "expected_score_range": f"{test_case['min_score']}-{test_case['max_score']}",
                "actual_score": report.risk_score
            })
            
    assert len(failures) == 0, f"Failed {len(failures)} URL tests: {failures}"

