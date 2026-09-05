from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import time
import hashlib

router = APIRouter()

class DarkWebScanRequest(BaseModel):
    email: str

class BreachRecord(BaseModel):
    title: str
    date: str
    compromised_data: List[str]
    description: str

class DarkWebScanResult(BaseModel):
    email: str
    breach_count: int
    breaches: List[BreachRecord]

@router.post("/monitor/darkweb", response_model=DarkWebScanResult)
async def monitor_darkweb_endpoint(req: DarkWebScanRequest):
    email = req.email.lower().strip()
    
    # Simulate API lookup delay
    time.sleep(1.5)
    
    # Deterministic mock based on email hashing
    # In a real scenario, this connects to the Have I Been Pwned API
    email_hash = hashlib.md5(email.encode()).hexdigest()
    first_char = email_hash[0]
    
    breaches = []
    
    if first_char in "012345":
        # Simulate 2 breaches
        breaches.append(
            BreachRecord(
                title="LinkedIn (2012)",
                date="2012-05-05",
                compromised_data=["Email addresses", "Passwords"],
                description="In May 2012, LinkedIn had 164 million email addresses and passwords exposed. Originally thought to be 6.5 million."
            )
        )
        breaches.append(
            BreachRecord(
                title="Collection #1 (2019)",
                date="2019-01-17",
                compromised_data=["Email addresses", "Passwords"],
                description="A massive collection of millions of email addresses and passwords posted to a hacking forum."
            )
        )
    elif first_char in "6789ab":
        # Simulate 1 breach
        breaches.append(
            BreachRecord(
                title="Adobe (2013)",
                date="2013-10-04",
                compromised_data=["Email addresses", "Password hints", "Passwords", "Usernames"],
                description="In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text."
            )
        )
        
    return DarkWebScanResult(
        email=email,
        breach_count=len(breaches),
        breaches=breaches
    )
