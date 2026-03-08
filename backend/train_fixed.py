import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load the FIXED dataset
df = pd.read_csv("users_fixed.csv")

print(f"Training with {len(df)} rows")
print("\nRisk distribution:")
print(df["risk_level"].value_counts())

# Remove any rows with missing values
df = df.dropna()

# Convert risk labels to numbers
label_map = {
    "GREEN": 0,
    "YELLOW": 1,
    "ORANGE": 2,
    "RED": 3
}

df["label"] = df["risk_level"].map(label_map)

# Features for training
features = [
    "hours_per_day",
    "volume_level",
    "noisy_environment",
    "events_per_month",
    "cli",
    "ehfa_mean",
    "hf_shift_index",
    "asymmetry"
]

X = df[features]
y = df["label"]

# Train the model
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42
)

model.fit(X, y)

# Save the model
joblib.dump(model, "hearsafe_rf.pkl")  # Save with the original name

print("\n✅ Model retrained and saved as 'hearsafe_rf.pkl'")

# Show feature importance
importance = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\n--- Feature Importance ---")
print(importance)