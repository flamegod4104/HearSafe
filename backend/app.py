from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import uuid
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODEL CONFIGURATION - FIXED VERSION
# ============================================
MODEL_PATH = "hearsafe_rf.pkl"  # Your newly trained model

# CORRECT RISK THRESHOLDS based on medical standards
RISK_THRESHOLDS = {
    "GREEN": {"max_ehfa": 25, "max_hfsi": 5},
    "YELLOW": {"max_ehfa": 40, "max_hfsi": 15},
    "ORANGE": {"max_ehfa": 55, "max_hfsi": 25},
    "RED": {"max_ehfa": 999, "max_hfsi": 999}
}

# ============================
# Utility Functions
# ============================

def cochlear_load_index(hours, volume, noisy_env, events):
    return round((hours * volume) + (2 if noisy_env else 0) + (events * 1.5), 2)

def age_group(age):
    if 18 <= age <= 25:
        return "18-25"
    elif 26 <= age <= 35:
        return "26-35"
    else:
        return "18-25"

def load_normative(age, sex):
    df = pd.read_csv("ehfa_baseline.csv")
    group = age_group(age)
    baseline = df[(df["age_group"] == group) & (df["sex"] == sex)]
    return baseline.sort_values("freq_hz")["mean_threshold"].values

def hf_shift_index(user_thresholds, normative):
    return round(np.mean(np.array(user_thresholds) - normative), 2)

def rule_engine(ehfa_mean, hfsi, cli=None):
    """
    CORRECT rule engine based on hearing thresholds
    Uses EHFA Mean as primary indicator
    """
    # PRIMARY RULE: Based on average hearing threshold
    if ehfa_mean <= 25:
        risk = "GREEN"
    elif ehfa_mean <= 40:
        risk = "YELLOW"
    elif ehfa_mean <= 55:
        risk = "ORANGE"
    else:
        risk = "RED"
    
    # SECONDARY RULE: Adjust based on HF Shift
    if hfsi > 25:
        risk = "RED"
    elif hfsi > 15 and risk == "YELLOW":
        risk = "ORANGE"
    elif hfsi > 5 and risk == "GREEN":
        risk = "YELLOW"
    
    return risk

def validate_ml_prediction(ehfa_mean, ml_prediction):
    """
    Validate ML prediction against common sense rules
    Prevents the model from giving GREEN for severe hearing loss
    """
    # Rule 1: EHFA > 55 can NEVER be GREEN or YELLOW
    if ehfa_mean > 55 and ml_prediction in ["GREEN", "YELLOW"]:
        print(f"⚠️ Validation: EHFA={ehfa_mean:.1f}dB, ML predicted {ml_prediction} -> OVERRIDING to RED")
        return "RED"
    
    # Rule 2: EHFA > 40 can NEVER be GREEN
    if ehfa_mean > 40 and ml_prediction == "GREEN":
        print(f"⚠️ Validation: EHFA={ehfa_mean:.1f}dB, ML predicted GREEN -> OVERRIDING to YELLOW")
        return "YELLOW"
    
    # Rule 3: EHFA > 25 and ML says GREEN, downgrade to YELLOW
    if ehfa_mean > 25 and ml_prediction == "GREEN":
        print(f"⚠️ Validation: EHFA={ehfa_mean:.1f}dB, ML predicted GREEN -> OVERRIDING to YELLOW")
        return "YELLOW"
    
    # If all checks pass, return ML prediction
    return ml_prediction

def load_model():
    """Load the trained model with error handling"""
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print(f"✅ Model loaded successfully from {MODEL_PATH}")
            return model
        else:
            print(f"⚠️ Model file {MODEL_PATH} not found, using rule engine")
            return None
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

# ============================
# Routes
# ============================

@app.get("/")
def home():
    return {"message": "HearSafe AI Backend Running"}

@app.post("/analyze")
def predict(data: dict):
    try:
        # ========== EXTRACT INPUT DATA ==========
        age = data["age"]
        sex = data["sex"]
        hours = data["hours_per_day"]
        volume = data["volume_level"]
        noisy_env = data["noisy_environment"]
        events = data["events_per_month"]
        thresholds = data["thresholds"]

        # ========== CALCULATE METRICS ==========
        cli = cochlear_load_index(hours, volume, noisy_env, events)
        normative = load_normative(age, sex)
        hfsi = hf_shift_index(thresholds, normative)
        ehfa_mean = round(np.mean(thresholds), 2)
        asymmetry = 0

        print(f"\n{'='*50}")
        print(f"🔍 ANALYZING HEARING TEST")
        print(f"{'='*50}")
        print(f"📊 Thresholds: {thresholds} dB")
        print(f"📈 EHFA Mean: {ehfa_mean} dB")
        print(f"📉 HF Shift Index: {hfsi} dB")
        print(f"🎧 CLI: {cli}")

        # ========== STEP 1: RULE ENGINE (Always runs) ==========
        rule_risk = rule_engine(ehfa_mean, hfsi, cli)
        print(f"\n⚖️  Rule Engine Result: {rule_risk}")

        # ========== STEP 2: ML MODEL (If available) ==========
        ml_risk = None
        model = load_model()
        
        if model:
            try:
                feature_vector = [
                    hours,           # hours_per_day
                    volume,          # volume_level
                    noisy_env,       # noisy_environment
                    events,          # events_per_month
                    cli,            # cochlear load index
                    ehfa_mean,      # average threshold
                    hfsi,           # high frequency shift
                    asymmetry       # asymmetry (0 for now)
                ]
                
                reverse_map = {0: "GREEN", 1: "YELLOW", 2: "ORANGE", 3: "RED"}
                pred = model.predict([feature_vector])[0]
                raw_ml_risk = reverse_map[pred]
                
                # Validate ML prediction
                ml_risk = validate_ml_prediction(ehfa_mean, raw_ml_risk)
                print(f"🤖 ML Model Raw: {raw_ml_risk}, After Validation: {ml_risk}")
                
            except Exception as e:
                print(f"❌ ML Prediction Error: {e}")
                ml_risk = None

        # ========== STEP 3: FINAL RISK DECISION ==========
        # Trust ML if it passed validation, otherwise use rule engine
        if ml_risk:
            final_risk = ml_risk
            print(f"\n✅ Using ML prediction (validated): {final_risk}")
        else:
            final_risk = rule_risk
            print(f"\n✅ Using rule engine: {final_risk}")

        # ========== STEP 4: CALCULATE OVERALL SCORE ==========
        # Convert EHFA mean to 0-100 score (lower threshold = higher score)
        if ehfa_mean <= 25:
            overall_score = 100 - (ehfa_mean * 0.5)  # 87.5 - 100
        elif ehfa_mean <= 40:
            overall_score = 75 - ((ehfa_mean - 25) * 1.67)  # 50 - 75
        elif ehfa_mean <= 55:
            overall_score = 50 - ((ehfa_mean - 40) * 1.67)  # 25 - 50
        else:
            overall_score = max(10, 25 - ((ehfa_mean - 55) * 0.5))  # 10 - 25
        
        overall_score = max(0, min(100, round(overall_score, 1)))

        print(f"\n📊 Overall Score: {overall_score}%")
        print(f"{'='*50}\n")

        # ========== STEP 5: SAVE TO CSV ==========
        import uuid
        from datetime import datetime
        
        new_row = {
            "user_id": str(uuid.uuid4())[:8],
            "age": age,
            "sex": sex,
            "date": datetime.now().date(),
            "hours_per_day": hours,
            "volume_level": volume,
            "noisy_environment": noisy_env,
            "events_per_month": events,
            "cli": cli,
            "ehfa_mean": ehfa_mean,
            "hf_shift_index": hfsi,
            "asymmetry": asymmetry,
            "risk_level": final_risk
        }

        try:
            df = pd.read_csv("users.csv")
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            df.to_csv("users.csv", index=False)
            print("💾 Test result saved to users.csv")
        except Exception as e:
            print(f"⚠️ Could not save to CSV: {e}")

        # ========== STEP 6: RETURN RESPONSE ==========
        return {
            "risk": final_risk,
            "risk_level": final_risk,
            "overall_score": overall_score,
            "cli": cli,
            "hf_shift_index": hfsi,
            "ehfa_mean": ehfa_mean,
            "thresholds": thresholds
        }

    except Exception as e:
        print(f"❌ ERROR in /analyze: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}