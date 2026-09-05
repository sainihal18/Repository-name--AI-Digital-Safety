from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import io

# We will try to import pyzbar and PIL, but mock if unavailable to prevent crashes
try:
    from PIL import Image
    from pyzbar.pyzbar import decode
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False

router = APIRouter()

class QRAnalysisResult(BaseModel):
    has_qr: bool
    decoded_url: Optional[str] = None
    risk_score: int
    verdict: str
    message: str

@router.post("/analyze/qr", response_model=QRAnalysisResult)
async def analyze_qr_endpoint(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'webp')):
        raise HTTPException(status_code=400, detail="Must be a PNG, JPG, or WEBP image.")
        
    contents = await file.read()
    
    if not PYZBAR_AVAILABLE:
        # Mock implementation if pyzbar is not installed (prevents strict dependency errors for portfolio viewers)
        # We simulate finding a malicious URL if the file name implies it.
        filename = file.filename.lower()
        if "malicious" in filename or "scam" in filename:
            return QRAnalysisResult(
                has_qr=True,
                decoded_url="http://secure-login-update-required.xyz",
                risk_score=92,
                verdict="HIGH RISK",
                message="Mock: Malicious URL found in QR code."
            )
        return QRAnalysisResult(
            has_qr=True,
            decoded_url="https://google.com",
            risk_score=10,
            verdict="LOW RISK",
            message="Mock: Safe URL found in QR code (pyzbar not installed)."
        )

    try:
        from PIL import Image
        img = Image.open(io.BytesIO(contents))
        decoded_objects = decode(img)
        
        if not decoded_objects:
            return QRAnalysisResult(
                has_qr=False,
                risk_score=0,
                verdict="UNKNOWN",
                message="No QR code detected in the image."
            )
            
        # Assuming the first QR code contains a URL
        qr_data = decoded_objects[0].data.decode('utf-8')
        
        # Here we would normally route to URLAnalyzer. For the sake of the endpoint, we simulate the risk analysis
        # based on simple heuristics to keep it standalone.
        risk_score = 15
        verdict = "LOW RISK"
        
        if qr_data.startswith("http") and not qr_data.startswith("https"):
            risk_score += 30
            
        suspicious_keywords = ["login", "verify", "secure", "update", "account"]
        if any(word in qr_data.lower() for word in suspicious_keywords):
            risk_score += 40
            
        if risk_score > 70:
            verdict = "HIGH RISK"
        elif risk_score > 40:
            verdict = "SUSPICIOUS"
            
        return QRAnalysisResult(
            has_qr=True,
            decoded_url=qr_data,
            risk_score=risk_score,
            verdict=verdict,
            message="QR code decoded successfully."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")
