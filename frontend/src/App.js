import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import Recognition from './pages/Recognition';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AnimatedBackground />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recognition" element={<Recognition />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
