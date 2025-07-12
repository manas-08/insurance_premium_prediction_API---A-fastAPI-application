import joblib
import pandas as pd
import os 

model_path = os.path.join(os.path.dirname(__file__), "insurance_ml_model.pkl")
# import the model 
with open(model_path, "rb") as f:
    model = joblib.load(f)

#ML FLow
MODEL_VERSION = '1.0.0'

def predict_output(user_input: dict):
    input_df = pd.DataFrame([user_input]) 
    output = model.predict(input_df)[0]
    return output