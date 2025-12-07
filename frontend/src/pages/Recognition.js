import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import axios from 'axios';
import './Recognition.css';

function Recognition() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [prediction, setPrediction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const processHand = useCallback(async (results) => {
    if (isProcessing) return;

    setIsProcessing(true);

    const landmarks = results.multiHandLandmarks[0];
    const boundingBox = calculateBoundingBox(landmarks);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const handImage = ctx.getImageData(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);

    const blob = await new Promise((resolve) => {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = boundingBox.width;
      offscreenCanvas.height = boundingBox.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCtx.putImageData(handImage, 0, 0);
      offscreenCanvas.toBlob(resolve, 'image/jpeg');
    });

    const formData = new FormData();
    formData.append('image', blob, 'hand.jpg');

    try {
      const response = await axios.post('http://localhost:5000/predict', formData);
      console.log('Backend response:', response.data);
      setPrediction(`Prediction: ${response.data.prediction}, Confidence: ${(response.data.confidence * 100).toFixed(2)}%`);
      setError('');
    } catch (error) {
      console.error('Error during prediction:', error);
      setPrediction('');
      setError('Error processing image. Make sure the backend server is running.');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const calculateBoundingBox = (landmarks) => {
    const xValues = landmarks.map((lm) => lm.x);
    const yValues = landmarks.map((lm) => lm.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const canvas = canvasRef.current;
    return {
      x: xMin * canvas.width,
      y: yMin * canvas.height,
      width: (xMax - xMin) * canvas.width,
      height: (yMax - yMin) * canvas.height,
    };
  };

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
          drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
        }
      }

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        processHand(results);
      }
    });

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          try {
            if (webcamRef.current && webcamRef.current.video) {
              await hands.send({ image: webcamRef.current.video });
            }
          } catch (error) {
            console.error('Error processing frame:', error);
            setError('Error accessing webcam. Please ensure camera permissions are granted.');
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      cameraRef.current = camera;
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      hands.close();
    };
  }, [processHand]);

  return (
    <div className="recognition">
      <h2>ASL Recognition</h2>
      <div className="webcam-container">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user',
          }}
          onUserMediaError={(err) => {
            console.error('Webcam error:', err);
            setError('Failed to access webcam. Please check your camera permissions.');
          }}
        />
        <canvas ref={canvasRef} className="overlay" width={640} height={480}></canvas>
      </div>
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}
      <div className="result">
        <h3>Prediction:</h3>
        <p>{prediction || 'Show your hand to get a prediction...'}</p>
      </div>
    </div>
  );
}

export default Recognition;
