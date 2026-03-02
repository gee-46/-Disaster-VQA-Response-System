import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import asyncio

app = FastAPI(title="Disaster VQA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Disaster VQA Backend Strategy Active"}

@app.post("/api/analyze")
async def analyze_image(
    image: UploadFile = File(None),
    question: str = Form(...)
):
    # Simulate processing delay for AI model (e.g. LLaVA / vision transformer)
    await asyncio.sleep(2.5) 
    
    question_lower = question.lower()
    
    if "fire" in question_lower or "smoke" in question_lower:
        answer = "Detected significant thermal anomaly and smoke plume. Structural integrity of the immediate area is compromised. Suggested action: immediate evacuation and deployment of aerial fire suppressants."
        risk_level = "High"
        confidence = 0.94
    elif "flood" in question_lower or "water" in question_lower:
        answer = "Visible water levels exceed 2 meters. Primary roads are submerged and impassable. Evacuation routes must be re-routed to higher elevation (Sector Alpha)."
        risk_level = "High"
        confidence = 0.91
    elif "people" in question_lower or "survivors" in question_lower:
        answer = "Identified 3 visible survivors trapped on the rooftop. No immediate fire threat, but water levels are rising. Awaiting priority rescue."
        risk_level = "Medium"
        confidence = 0.88
    else:
        answer = "Analysis complete. Structural damage is prevalent. Debris obstructing main pathways. Recommend deploying drone swarm for higher resolution mapping."
        risk_level = random.choice(["Low", "Medium", "High"])
        confidence = round(random.uniform(0.75, 0.99), 2)
        
