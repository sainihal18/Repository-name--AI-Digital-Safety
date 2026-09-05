from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import email
from email.policy import default

router = APIRouter()

class EmailAnalyzeRequest(BaseModel):
    raw_email: str

class EmailAnalysisResult(BaseModel):
    subject: str
    sender: str
    recipient: str
    spf_status: str
    dkim_status: str
    dmarc_status: str
    received_hops: List[str]
    anomalies: List[str]
    risk_score: int

@router.post("/analyze/email", response_model=EmailAnalysisResult)
async def analyze_email_endpoint(req: EmailAnalyzeRequest):
    try:
        msg = email.message_from_string(req.raw_email, policy=default)
        
        subject = msg.get("Subject", "Unknown")
        sender = msg.get("From", "Unknown")
        recipient = msg.get("To", "Unknown")
        
        # Simulated parsing of auth headers (Authentication-Results)
        auth_results = msg.get("Authentication-Results", "")
        spf = "PASS" if "spf=pass" in auth_results.lower() else ("FAIL" if "spf=fail" in auth_results.lower() else "NONE")
        dkim = "PASS" if "dkim=pass" in auth_results.lower() else ("FAIL" if "dkim=fail" in auth_results.lower() else "NONE")
        dmarc = "PASS" if "dmarc=pass" in auth_results.lower() else ("FAIL" if "dmarc=fail" in auth_results.lower() else "NONE")
        
        # Track hops
        hops = msg.get_all("Received") or []
        parsed_hops = [hop.replace("\n", " ").strip() for hop in hops]
        
        anomalies = []
        risk_score = 0
        
        # Check for Reply-To anomaly
        reply_to = msg.get("Reply-To")
        if reply_to and sender not in reply_to: # Basic check
            anomalies.append("Mismatch between 'From' and 'Reply-To' addresses.")
            risk_score += 40
            
        if spf == "FAIL" or dkim == "FAIL":
            anomalies.append("Sender authentication failed (SPF/DKIM mismatch).")
            risk_score += 50
            
        if not hops:
            anomalies.append("No routing history found (empty Received headers).")
            risk_score += 20
            
        risk_score = min(100, risk_score)
        
        return EmailAnalysisResult(
            subject=subject,
            sender=sender,
            recipient=recipient,
            spf_status=spf,
            dkim_status=dkim,
            dmarc_status=dmarc,
            received_hops=parsed_hops,
            anomalies=anomalies,
            risk_score=risk_score
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse email: {str(e)}")
