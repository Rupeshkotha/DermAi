from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Optional, List
import os
from dotenv import load_dotenv
from PIL import Image
import io
from app.model.model_handler import ModelHandler
from app.utils.gpt_handler import GPTHandler

# Load environment variables
load_dotenv()

app = FastAPI(title="Skin Disease Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize handlers
model_handler = ModelHandler()
gpt_handler = GPTHandler()

class AIInsights(BaseModel):
    overview: str
    symptoms: List[str]
    treatment: List[str]
    medical_care: List[str]
    prevention: List[str]

class DiseaseResponse(BaseModel):
    disease_name: str
    confidence: float
    ai_insights: AIInsights

@app.get("/")
async def root():
    return {"message": "Welcome to Skin Disease Detection API"}

@app.post("/detect", response_model=DiseaseResponse)
async def detect_disease(file: UploadFile = File(...)):
    try:
        # Read and validate image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Get model prediction
        prediction = model_handler.predict(image)
        
        # Get disease information from GPT
        try:
            disease_info = gpt_handler.get_disease_info(prediction["class"])
        except Exception as e:
            print(f"Error getting disease info: {str(e)}")
            disease_info = "Unable to generate detailed information at this time."
        
        # Return combined response
        return {
            "disease_name": prediction["class"],
            "confidence": prediction["confidence"],
            "ai_insights": {
                "overview": disease_info["overview"],
                "symptoms": disease_info["symptoms"],
                "treatment": disease_info["treatment"],
                "medical_care": disease_info["medical_care"],
                "prevention": disease_info["prevention"]
            }
        }
        
    except Exception as e:
        print(f"Error in detect endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True) 