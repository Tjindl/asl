from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import json
import os

app = Flask(__name__)

# --- CORS Configuration ---
FRONTEND_URL = os.environ.get('FRONTEND_URL', '*')
CORS(app, origins=[FRONTEND_URL] if FRONTEND_URL != '*' else '*')

# --- Load the landmark-based model ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'model')

landmark_model = None
CLASS_LABELS = []

try:
    model_path = os.path.join(MODEL_DIR, 'asl_landmark_model.joblib')
    landmark_model = joblib.load(model_path)
    print(f"Landmark model loaded from {model_path}")

    metadata_path = os.path.join(MODEL_DIR, 'landmark_model_metadata.json')
    with open(metadata_path) as f:
        metadata = json.load(f)
    CLASS_LABELS = metadata['class_labels']
    print(f"Classes: {CLASS_LABELS}")
except Exception as e:
    print(f"Error loading landmark model: {e}")


def normalize_landmarks(landmarks_list):
    """Normalize landmarks: translate to wrist origin, scale by hand size."""
    coords = np.array(landmarks_list, dtype=np.float64)
    wrist = coords[0].copy()
    coords -= wrist
    scale = np.linalg.norm(coords[9])
    if scale > 1e-6:
        coords /= scale
    return coords.flatten()


@app.route('/')
def index():
    return jsonify({"message": "ASL Recognition API is running"})


@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": landmark_model is not None,
        "classes": len(CLASS_LABELS),
    })


@app.route('/predict', methods=['POST'])
def predict():
    if landmark_model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    try:
        data = request.get_json()
        if not data or 'landmarks' not in data:
            return jsonify({'error': 'No landmarks provided'}), 400

        landmarks = data['landmarks']
        if len(landmarks) != 21:
            return jsonify({'error': f'Expected 21 landmarks, got {len(landmarks)}'}), 400

        landmarks_array = [[lm['x'], lm['y'], lm['z']] for lm in landmarks]
        features = normalize_landmarks(landmarks_array)
        features = features.reshape(1, -1)

        prediction = landmark_model.predict(features)
        probabilities = landmark_model.predict_proba(features)[0]
        predicted_class = prediction[0]
        confidence = float(probabilities[predicted_class])
        predicted_letter = CLASS_LABELS[predicted_class]

        return jsonify({
            'prediction': predicted_letter,
            'confidence': confidence
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
