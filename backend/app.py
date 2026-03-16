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

# ─── ISO 7029 Presbycusis correction table ────────────────────────────────────
# Expected age-related threshold shift (dB) by age and frequency
# Source: ISO 7029:2017 — values for median (50th percentile)
# Frequencies: 500, 1000, 2000, 3000, 4000, 6000, 8000 Hz
PRESBYCUSIS_TABLE = {
    # age: [500, 1000, 2000, 3000, 4000, 6000, 8000]
    20:  [0,  0,  0,  0,  0,  0,  0],
    25:  [0,  0,  0,  1,  1,  2,  3],
    30:  [0,  0,  1,  2,  3,  4,  6],
    35:  [0,  1,  2,  4,  5,  7,  9],
    40:  [1,  1,  3,  6,  8, 11, 14],
    45:  [1,  2,  5,  8, 11, 16, 20],
    50:  [2,  3,  7, 11, 15, 22, 28],
    55:  [3,  4,  9, 14, 20, 29, 37],
    60:  [4,  5, 12, 18, 26, 37, 48],
    65:  [5,  7, 15, 23, 33, 46, 59],
    70:  [7,  9, 19, 29, 41, 56, 71],
    75:  [9, 12, 24, 36, 50, 67, 83],
    80:  [11,15, 29, 44, 59, 79, 95],
}

def get_presbycusis_correction(age: int, sex: str) -> list:
    """
    Returns expected age-related threshold shift per frequency.
    Males have slightly more loss — applying 10% extra for M.
    Frequencies: 500,1000,2000,3000,4000,6000,8000 Hz
    """
    # Round age to nearest decade in table
    age = max(20, min(80, age))
    rounded = int(round(age / 5.0) * 5)
    if rounded not in PRESBYCUSIS_TABLE:
        rounded = min(PRESBYCUSIS_TABLE.keys(), key=lambda x: abs(x - age))
    
    correction = PRESBYCUSIS_TABLE[rounded].copy()
    
    # Males lose ~10% more hearing with age per ISO 7029
    if sex == "M":
        correction = [round(c * 1.1) for c in correction]
    
    return correction

def apply_presbycusis_correction(thresholds: list, age: int, sex: str) -> list:
    """
    Subtract expected age-related loss from raw thresholds.
    Result = what the hearing would be if age-related loss is excluded.
    Negative values are clamped to 0.
    """
    correction = get_presbycusis_correction(age, sex)
    # If thresholds has 8 values (includes 250Hz), skip first correction value
    if len(thresholds) == 8:
        correction = [0] + correction  # pad for 250 Hz
    corrected = [max(-10, t - c) for t, c in zip(thresholds, correction)]
    return corrected


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
    if 18 <= age <= 25:   return "18-25"
    elif 26 <= age <= 35: return "26-35"
    elif 36 <= age <= 45: return "36-45"
    elif 46 <= age <= 55: return "46-55"
    elif 56 <= age <= 65: return "56-65"
    else:                 return "66+"

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

# ========== PRESBYCUSIS CORRECTION ==========
        corrected_thresholds = apply_presbycusis_correction(thresholds, age, sex)
        correction_applied   = get_presbycusis_correction(age, sex)
        print(f"👂 Raw thresholds:       {thresholds}")
        print(f"📉 Presbycusis correction: {correction_applied}")
        print(f"✅ Corrected thresholds: {corrected_thresholds}")

# ========== CALCULATE METRICS ==========
        cli = cochlear_load_index(hours, volume, noisy_env, events)
        normative = load_normative(age, sex)
        hfsi = hf_shift_index(corrected_thresholds, normative)
        ehfa_mean = round(np.mean(corrected_thresholds), 2)
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
            "thresholds": thresholds,                    # raw — for audiogram display
            "corrected_thresholds": corrected_thresholds, # age-adjusted — for scoring
            "presbycusis_correction": correction_applied, # how much was subtracted
            "age_correction_applied": age >= 40           # flag for frontend to show note
        }

    except Exception as e:
        print(f"❌ ERROR in /analyze: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}