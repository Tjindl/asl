from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load the model
model = None
try:
    model = tf.keras.models.load_model('model/asl_final.h5')  # Ensure the correct model filename
    print("Model loaded successfully!")
except Exception as e:
    model = None
    print(f"Error loading model: {e}")
    print("Please ensure the 'asl_final.h5' file exists in the 'model' directory.")

# Preprocess the image
def preprocess_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to grayscale
        image = image.convert('L')
        # Resize to match model input size
        image = image.resize((28, 28))
        # Normalize pixel values and add batch/channel dimensions
        image_array = np.array(image, dtype=np.float32) / 255.0
        return np.expand_dims(image_array, axis=(0, -1))  # Shape: (1, 28, 28, 1)
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise

@app.route('/')
def home():
    return jsonify({"message": "ASL Recognition API is running"})

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        print("Model not loaded. Returning 503 error.")
        return jsonify({'error': 'Model not loaded. Ensure the model file exists in the model directory.'}), 503

    try:
        if 'image' not in request.files:
            print("No image provided in the request.")
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']
        image_bytes = file.read()
        print(f"Received image of size: {len(image_bytes)} bytes")

        processed_image = preprocess_image(image_bytes)
        print(f"Processed image shape: {processed_image.shape}")
        print(f"Processed image data (first 10 pixels): {processed_image.flatten()[:10]}")

        # Make prediction
        prediction = model.predict(processed_image)
        print(f"Raw model prediction: {prediction}")
        predicted_class = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class])

        print(f"Prediction: {chr(predicted_class + ord('A'))}, Confidence: {confidence}")

        return jsonify({
            'prediction': chr(predicted_class + ord('A')),  # Map to letter
            'confidence': confidence
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)