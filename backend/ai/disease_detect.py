import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image
import io
from typing import Dict, Any

# Load model globally to avoid reloading on each request
MODEL_PATH = "crop_disease_model.h5"
CLASS_INDICES_PATH = "class_indices.json"

_model = None
_class_names = None

def get_model():
    global _model, _class_names
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = tf.keras.models.load_model(MODEL_PATH)
        else:
            print(f"Warning: Model not found at {MODEL_PATH}")
    if _class_names is None:
        if os.path.exists(CLASS_INDICES_PATH):
            with open(CLASS_INDICES_PATH, "r") as f:
                _class_names = json.load(f)
        else:
            print(f"Warning: Class indices not found at {CLASS_INDICES_PATH}")
    return _model, _class_names

def map_class_to_translation(class_name: str, language: str) -> Dict[str, Any]:
    # Clean up the class name (e.g., 'Tomato___Early_blight' -> 'Tomato - Early blight')
    clean_name = class_name.replace("___", " - ").replace("__", " ").replace("_", " ")
    
    # Basic generic template
    result = {
        "disease": clean_name,
        "severity": "Medium",
        "treatment": "Please consult a local agronomist for specific treatment.",
        "recoveryTime": "7-10 Days",
        "cost": 200,
        "dealer": "Local Cooperative Society"
    }
    
    class_name_lower = class_name.lower()
    
    if "healthy" in class_name_lower:
        result["severity"] = "None"
        result["treatment"] = "No treatment required. Maintain current schedule."
        result["recoveryTime"] = "N/A"
        result["cost"] = 0
    elif "early blight" in class_name_lower or "late blight" in class_name_lower or "leaf spot" in class_name_lower or "leaf_spot" in class_name_lower:
        result["severity"] = "High"
        result["treatment"] = "Apply appropriate fungicide (e.g., Copper Oxychloride 2g/L)."
        result["cost"] = 250
    elif "bacterial" in class_name_lower:
        result["severity"] = "High"
        result["treatment"] = "Apply antibacterial sprays like Streptocycline 1g/10L."
        result["cost"] = 300
    elif "virus" in class_name_lower:
        result["severity"] = "Severe"
        result["treatment"] = "Remove and destroy infected plants. Control insect vectors."
        result["cost"] = 100
        
    return result

def detect_disease(image_bytes: bytes, language: str = "English") -> Dict[str, Any]:
    """
    Runs actual MobileNetV3 classification inference.
    """
    model, class_names = get_model()
    
    if model is None or class_names is None:
        # Fallback if model isn't trained yet
        print("Model not loaded, falling back to simulated inference.")
        result = {
            "disease": "Model Not Loaded",
            "severity": "Unknown",
            "treatment": "Please wait for model to train.",
            "recoveryTime": "N/A",
            "cost": 0,
            "dealer": "N/A"
        }
        result["confidence"] = 0.0
        return result
        
    try:
        # Preprocess the image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((256, 256))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = img_array / 255.0  # Normalize to [0,1] like training
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_idx]) * 100
        
        predicted_class_name = class_names[predicted_idx]
        print(f"Predicted: {predicted_class_name} with confidence {confidence}%")
        
        result = map_class_to_translation(predicted_class_name, language)
        result["confidence"] = round(confidence, 1)
        return result
        
    except Exception as e:
        print(f"Error during disease detection inference: {e}")
        result = {
            "disease": "Analysis Error",
            "severity": "Unknown",
            "treatment": "Failed to analyze image.",
            "recoveryTime": "N/A",
            "cost": 0,
            "dealer": "N/A"
        }
        result["confidence"] = 0.0
        return result
