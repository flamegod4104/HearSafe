from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()
#CORS fix
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load trained model
model = joblib.load("hearing_model.pkl")

@app.get("/")
def home():
    return {"message": "Hearing ML API is running"}

@app.post("/predict")
def predict(data: dict):
    try:
        features = np.array([[
            data["250Hz"],
            data["500Hz"],
            data["1000Hz"],
            data["2000Hz"],
            data["4000Hz"],
            data["8000Hz"]
        ]])

        prediction = model.predict(features)

        labels = [
            "Normal",
            "Mild Sloping Loss",
            "Noise-Induced Loss",
            "Moderate Loss",
            "Severe Loss"
        ]

        return {
            "classification": labels[int(prediction[0])]
        }

    except Exception as e:
        return {"error": str(e)}
