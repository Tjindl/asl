import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1>ASL Recognition App</h1>
      <p>Welcome to the ASL Recognition application</p>
      <Link to="/recognition" className="start-button">
        Start Recognition
      </Link>
    </div>
  );
}

export default Home;
