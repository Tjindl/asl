import React, { useState, useRef } from 'react';
import axios from 'axios';

function Recognition() {
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error processing image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recognition">
      <h2>ASL Recognition</h2>
      <div className="upload-section">
        <button className="button" onClick={() => fileInputRef.current.click()}>
          Upload Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
      
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Uploaded ASL sign" />
        </div>
      )}
      
      {isLoading && <div className="loading">Processing...</div>}
      {prediction && (
        <div className="result">
          <h3>Prediction:</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default Recognition;
