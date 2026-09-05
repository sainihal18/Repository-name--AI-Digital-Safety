from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import time

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    
class CopilotRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    context: Optional[str] = None # Generic context string describing the current page/scan

class CopilotResponse(BaseModel):
    reply: str

@router.post("/copilot/chat", response_model=CopilotResponse)
async def cyber_copilot_chat(req: CopilotRequest):
    # Simulated AI logic
    time.sleep(1) # Simulate think time
    
    msg = req.message.lower()
    
    if "help" in msg:
        reply = "I am the AI Digital Safety Copilot. I can analyze your threat data, explain complex security concepts, or help you secure your systems. What do you need help with?"
    elif "spf" in msg or "dkim" in msg or "dmarc" in msg:
        reply = "SPF, DKIM, and DMARC are email authentication protocols. SPF verifies the sending server, DKIM signs the email cryptographically, and DMARC tells the receiver what to do if those fail. If you see 'FAIL', the email is likely spoofed or a phishing attempt."
    elif "password" in msg:
        reply = "A strong password should have high entropy—meaning a large character space and sufficient length. It's best to use a password manager to generate random 16+ character passwords for every site, rather than trying to memorize them."
    elif "port" in msg and "open" in msg:
        reply = "An open port indicates a service is listening. For example, if Port 22 (SSH) is open to the public internet, you might be subjected to brute-force attacks. Always keep administrative ports behind a VPN or whitelist."
    elif req.context and "risk" in req.context.lower():
        reply = f"Looking at your current scan context ({req.context}), the high risk score is derived from our threat intelligence fusion algorithm. Are you concerned about a specific indicator?"
    else:
        reply = "I monitor your active security feed. Based on your current operations, you appear secure, but always remain vigilant about unexpected emails or unusual login prompts. Do you have a specific scan or threat you want me to explain?"
        
    return CopilotResponse(reply=reply)
