import time
from fastapi import APIRouter, File, UploadFile, HTTPException

from backend.analyzers.image_analyzer import analyze_image
from backend.models.schemas import AnalysisReport

router = APIRouter()

@router.post(
    "/analyze/image",
    response_model=AnalysisReport,
    summary="Analyze a screenshot or image",
    description="Upload an image (screenshot, poster, etc.) to extract text and URLs via OCR, then analyze for threats.",
)
async def api_analyze_image(file: UploadFile = File(...)):
    """
    Endpoint for multimodal image analysis.
    Takes a multipart/form-data upload.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"File must be an image. Received: {file.content_type}"
        )
        
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image data: {str(e)}")
        
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image data received.")
        
    start_time = time.time()
    
    # Process through the ImageAnalyzer pipeline
    report = await analyze_image(contents, file.filename)
    
    elapsed = round(time.time() - start_time, 3)
    # Could optionally log elapsed time here if we have structured logging
    
    return report
