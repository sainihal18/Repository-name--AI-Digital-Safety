import uuid
from datetime import datetime, timezone
import base64

from backend.models.enums import InputType, Verdict, ScamCategory
from backend.models.schemas import AnalysisReport, ModelInfo, ScamDNA, ThreatIntelResult
from backend.analyzers.sms_analyzer import SMSAnalyzer
from backend.analyzers.url_analyzer import URLAnalyzer



class ImageAnalyzer:
    """
    Analyzes screenshots (either Base64 or binary data).
    Ideally uses OCR to extract text and links, then routes text through SMSAnalyzer 
    and URLs through URLAnalyzer. Fuses the results.
    """
    
    def __init__(self):
        self.sms_analyzer = SMSAnalyzer()
        self.url_analyzer = URLAnalyzer()

        
    async def analyze(self, image_data: bytes, filename: str = "screenshot.png") -> AnalysisReport:
        """
        Main entry point for image analysis.
        Currently, this is a simulated stub that extracts hypothetical text depending on filename.
        In a real scenario, this would use OCR (like Tesseract or a multimodal LLM).
        """
        
        # MOCK OCR RESULTS
        extracted_text = "Login to your account"
        extracted_urls = []
        is_phishing_mock = False
        
        # Simple mock logic based on file size or name to allow testing different cases
        if "scam" in filename.lower() or "phish" in filename.lower() or len(image_data) > 1000000:
            extracted_text = "URGENT: Your account will be locked. Verify immediately at http://secure-login-update.com"
            extracted_urls = ["http://secure-login-update.com"]
            is_phishing_mock = True
            
        elif "bank" in filename.lower():
            extracted_text = "Your daily transfer limit has been exceeded. If not you, click http://chase-alert-fraud.com"
            extracted_urls = ["http://chase-alert-fraud.com"]
            is_phishing_mock = True

        report_id = f"img_{uuid.uuid4().hex[:8]}"
        
        # If we have extracted URLs, analyze the first one as primary
        if extracted_urls:
            from backend.services.analysis_service import analyze_url
            
            # Since analyze_url takes (db, url) in this codebase and it's synchronous
            report = analyze_url(None, extracted_urls[0])
            
            # Repackage as image analysis
            report.input_type = InputType.SCREENSHOT
            report.analysis_id = report_id
            
            # Add a mock limitation stating it was OCR'd
            report.limitations.append("Image analysis relies on OCR extraction which may introduce artifacts.")
            return report
            
        else:
            # Fallback to text analysis
            from backend.services.analysis_service import analyze_sms
            
            report = analyze_sms(None, extracted_text)
            
            report.input_type = InputType.SCREENSHOT
            report.analysis_id = report_id
            report.limitations.append("Image analysis relies on OCR extraction which may introduce artifacts.")
            return report

# Global singleton
image_analyzer = ImageAnalyzer()

async def analyze_image(image_bytes: bytes, filename: str) -> AnalysisReport:
    """Facade for the analyzer."""
    return await image_analyzer.analyze(image_bytes, filename)
