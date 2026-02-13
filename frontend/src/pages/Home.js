import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero-chip">
          <span className="hero-chip-dot" />
          Live Recognition
        </div>
        <h1 className="hero-h1">
          Translate sign language<br />
          with your camera
        </h1>
        <p className="hero-p">
          SignLens uses AI-powered hand tracking to recognize 24 ASL letters
          in real time. No setup required.
        </p>
        <Link to="/recognition" className="hero-btn">
          <span>Start Recognizing</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9h10.5m0 0L10 4.75M14.25 9L10 13.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>

      {/* Stats */}
      <section className="stats-row">
        <div className="stat-item">
          <div className="stat-icon stat-icon-cyan">A</div>
          <div>
            <div className="stat-val">24 Letters</div>
            <div className="stat-desc">A-Y excluding J & Z</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon stat-icon-green">%</div>
          <div>
            <div className="stat-val">94.7% Accuracy</div>
            <div className="stat-desc">Trained on 10,700 samples</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon stat-icon-amber">&#9889;</div>
          <div>
            <div className="stat-val">Real-time</div>
            <div className="stat-desc">30fps hand tracking</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how">
        <h2 className="how-heading">How it works</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-num how-num-cyan">01</div>
            <h3>Show your hand</h3>
            <p>Make any ASL letter sign in front of your webcam. The AI will detect your hand automatically.</p>
          </div>
          <div className="how-card">
            <div className="how-num how-num-teal">02</div>
            <h3>Landmark detection</h3>
            <p>MediaPipe tracks 21 key points on your hand, capturing the precise shape and finger positions.</p>
          </div>
          <div className="how-card">
            <div className="how-num how-num-amber">03</div>
            <h3>Instant classification</h3>
            <p>Our trained model analyzes the hand pose and identifies the ASL letter with a confidence score.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
