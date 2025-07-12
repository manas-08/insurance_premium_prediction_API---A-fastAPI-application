from fastapi import FastAPI
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
from schema.user_input import UserInput
from model.predict import predict_output, model, MODEL_VERSION
from schema.prediction_response import PredictionResponse
app = FastAPI()

## all routes here 
@app.get("/")
def home():
    return {"message": "This is a insurance premium predictor API!"}

@app.post('/predict', response_model=PredictionResponse)
def predict_premium(data: UserInput):
    user_input = {
        "bmi": data.bmi,
        "age_group": data.age_group,
        "lifestyle_risk": data.lifestyle_risk,
        "city_category": data.city_category,
        "occupation": data.occupation,
        "income_lpa": data.income_lpa,
    }  
    try: 
        prediction = predict_output(user_input)
        return JSONResponse(status_code=200, content={'predicted_category': prediction})
    
    except Exception as e:
        # You can still use JSONResponse for errors
        return JSONResponse(status_code=500, content={"error": str(e)})


## machine readable [this will make the services like AWS to check whether the API is working fine or not]
@app.get("/health")
def health_check():
    return {
        'status': "OK",
        "version": MODEL_VERSION,
        "model_loaded": model is not None
    } 
