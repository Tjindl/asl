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
    model = tf.keras.models.load_model('model/asl_model.h5')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Please ensure:")
    print("1. The 'model' directory exists in the backend folder")
    print("2. The model file 'asl_model.h5' is present in the model directory")

# Map numeric predictions to letters
LABELS = [chr(i) for i in range(ord('A'), ord('Z')+1)]

def preprocess_image(image_bytes):
    # Convert bytes to image
    image = Image.open(io.BytesIO(image_bytes))
    # Resize image to match model input size
    image = image.resize((64, 64))
    # Convert to array and normalize
    image_array = np.array(image) / 255.0
    # Add batch dimension
    return np.expand_dims(image_array, axis=0)

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Please check server logs.'}), 503
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        prediction = model.predict(processed_image)
        predicted_class = np.argmax(prediction[0])
        predicted_letter = LABELS[predicted_class]
        
        return jsonify({
            'prediction': predicted_letter,
            'confidence': float(prediction[0][predicted_class])
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
