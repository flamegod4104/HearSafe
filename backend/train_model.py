import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# -----------------------------
# 1️⃣ Load Dataset
# -----------------------------
df = pd.read_csv("realistic_synthetic_audiogram_data.csv")

X = df.drop("Label", axis=1)
y = df["Label"]

# -----------------------------
# 2️⃣ Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# 3️⃣ Train Random Forest Model
# -----------------------------
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# 4️⃣ SAVE MODEL (Before plotting)
# -----------------------------
model_path = os.path.join(os.getcwd(), "hearing_model.pkl")
joblib.dump(model, model_path)

print(f"\n✅ Model saved successfully at: {model_path}")

# -----------------------------
# 5️⃣ Evaluate Model
# -----------------------------
y_pred = model.predict(X_test)

print("\n📊 Classification Report:\n")
print(classification_report(y_test, y_pred))

# -----------------------------
# 6️⃣ Confusion Matrix
# -----------------------------
cm = confusion_matrix(y_test, y_pred)

plt.figure()
sns.heatmap(cm, annot=True, fmt="d")
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

# -----------------------------
# 7️⃣ Feature Importance
# -----------------------------
importances = model.feature_importances_
features = X.columns

plt.figure()
plt.barh(features, importances)
plt.title("Feature Importance")
plt.show()
