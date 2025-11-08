import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <h1>ASL Recognition App</h1>
      <p>Detect and translate American Sign Language gestures in real-time</p>
      <Link to="/recognition" className="start-button button">
        Start Recognition
      </Link>
    </div>
  );
}

export default Home;
