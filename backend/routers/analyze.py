from fastapi import APIRouter, File, UploadFile, Form
from io import BytesIO
from PIL import Image
import base64
from ..ml.model_pipeline import vqa_pipeline
from ..ml.object_detection import object_detector
from ..services.history_service import history_service

router = APIRouter()

@router.on_event("startup")
async def startup_event():
    vqa_pipeline.load_model()
    object_detector.load_model()

@router.post("/api/analyze")
async def analyze_image(
    image: UploadFile = File(None),
    question: str = Form(...)
):
    img = None
    annotated_img = None
    detected_objects = []
    
    if image:
        content = await image.read()
        img = Image.open(BytesIO(content)).convert("RGB")
        
        # Run YOLO Object Detection before VQA (as requested)
        annotated_img, detected_objects = object_detector.detect_objects(img)
        
    # Run ML Inference using the annotated image if it exists, otherwise original
    inference_img = annotated_img if annotated_img else img
    result = vqa_pipeline.generate(inference_img, question)
    
    # Save to history DB
    history_service.add_entry(
        question=question,
        answer=result["answer"],
        confidence=result["confidence"],
        risk_level=result["risk_level"],
        inference_time_ms=result["inference_time_ms"],
        model=result["model"]
    )
    
    # Add optional detection response fields while keeping original structure
    result["detected_objects"] = detected_objects
    
    if annotated_img:
        buffered = BytesIO()
        annotated_img.save(buffered, format="JPEG", quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        result["annotated_image"] = f"data:image/jpeg;base64,{img_str}"

    return result

