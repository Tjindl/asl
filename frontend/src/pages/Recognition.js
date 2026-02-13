import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import axios from 'axios';
import './Recognition.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function Recognition() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const isProcessingRef = useRef(false);
  const [letter, setLetter] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('initializing');
  const [webcamReady, setWebcamReady] = useState(false);
  const [history, setHistory] = useState([]);

  const processHand = useCallback(async (landmarks) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const landmarkData = landmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }));

      const response = await axios.post(`${API_URL}/predict`, {
        landmarks: landmarkData,
      });

      const { prediction: pred, confidence: conf } = response.data;
      setLetter(pred);
      setConfidence(Math.round(conf * 100));
      setError('');

      setHistory((prev) => {
        const next = [pred, ...prev];
        return next.slice(0, 20);
      });
    } catch (err) {
      setError('Cannot reach backend');
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setStatus('detected');
        for (const lms of results.multiHandLandmarks) {
          drawConnectors(ctx, lms, HAND_CONNECTIONS, {
            color: 'rgba(34, 211, 238, 0.45)',
            lineWidth: 1.5,
          });
          drawLandmarks(ctx, lms, {
            color: 'rgba(34, 211, 238, 0.7)',
            fillColor: 'rgba(34, 211, 238, 0.25)',
            lineWidth: 1,
            radius: 2.5,
          });
        }
        processHand(results.multiHandLandmarks[0]);
      } else {
        setStatus('waiting');
      }
    });

    handsRef.current = hands;

    hands.initialize().then(() => {
      setStatus('ready');
    }).catch(() => {
      setError('Failed to load hand detection model');
    });

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      hands.close();
    };
  }, [processHand]);

  useEffect(() => {
    if (!webcamReady || !handsRef.current) return;
    if (cameraRef.current) return;

    const video = webcamRef.current?.video;
    if (!video) return;

    setStatus('starting');

    const camera = new Camera(video, {
      onFrame: async () => {
        try {
          if (webcamRef.current?.video && handsRef.current) {
            await handsRef.current.send({ image: webcamRef.current.video });
          }
        } catch (err) { /* ignore */ }
      },
      width: 640,
      height: 480,
    });
    camera.start();
    cameraRef.current = camera;
  }, [webcamReady]);

  const isLoading = ['initializing', 'ready', 'starting'].includes(status);

  const statusText = {
    initializing: 'Loading AI...',
    ready: 'Waiting for camera...',
    starting: 'Starting...',
    detected: 'Tracking',
    waiting: 'No hand detected',
  }[status] || 'Initializing...';

  const statusColor = status === 'detected' ? 'var(--green)' :
                      status === 'waiting' ? 'var(--text-tertiary)' :
                      'var(--cyan)';

  const confColor = confidence >= 70 ? 'var(--green)' :
                    confidence >= 40 ? 'var(--amber)' :
                    'var(--red)';

  return (
    <div className="rec">
      {/* Top bar */}
      <div className="rec-topbar">
        <div className="rec-status" style={{ color: statusColor }}>
          <span className={`rec-dot${status === 'detected' ? ' rec-dot-pulse' : ''}`} style={{
            background: statusColor,
            boxShadow: status === 'detected' ? `0 0 8px var(--green)` : 'none',
          }} />
          {statusText}
        </div>
      </div>

      <div className="rec-grid">
        {/* Camera */}
        <div className="rec-camera-wrap">
          <div className={`rec-camera${status === 'detected' ? ' detected' : ''}`}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rec-video"
              videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
              onUserMedia={() => setWebcamReady(true)}
              onUserMediaError={() => setError('Camera access denied')}
            />
            <canvas ref={canvasRef} className="rec-overlay" width={640} height={480} />
            {isLoading && (
              <div className="rec-loader">
                <div className="rec-spinner" />
              </div>
            )}
          </div>

          {/* Floating prediction badge on camera */}
          {letter && !isLoading && (
            <div className="rec-floating-badge">
              <span className="rec-floating-letter">{letter}</span>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="rec-side">
          {/* Prediction */}
          <div className="rec-card rec-prediction-card">
            <div className="rec-card-label">Prediction</div>
            <div className={`rec-letter${letter ? ' rec-letter-glow' : ''}`} style={{ color: letter ? 'var(--text-primary)' : 'var(--text-dim)' }}>
              {letter || '—'}
            </div>
            {letter && (
              <>
                <div className="rec-conf-bar">
                  <div className="rec-conf-fill" style={{ width: `${confidence}%`, background: confColor }} />
                </div>
                <div className="rec-conf-text" style={{ color: confColor }}>
                  {confidence}%
                </div>
              </>
            )}
          </div>

          {/* History */}
          <div className="rec-card">
            <div className="rec-card-label">History</div>
            {history.length > 0 ? (
              <div className="rec-history">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className="rec-history-char"
                    style={{ opacity: Math.max(0.25, 1 - i * 0.04) }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rec-history-empty">Letters will appear here</div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rec-error">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Recognition;
