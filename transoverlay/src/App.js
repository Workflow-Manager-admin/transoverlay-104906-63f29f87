import React, { useState } from 'react';
import './App.css';
import TransOverlay from './components/TransOverlay';

function App() {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> TransOverlay
            </div>
            <button 
              className="btn"
              onClick={() => setShowOverlay(!showOverlay)}
            >
              {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ position: 'relative', height: 'calc(100vh - 60px)' }}>
        <div className="container">
          <div className="hero">
            <div className="subtitle">Real-time Text Translation</div>
            
            <h1 className="title">TransOverlay</h1>
            
            <div className="description">
              A transparent overlay for real-time text translation. Drag the overlay 
              anywhere on the screen or drop text files for instant translation.
            </div>
          </div>
        </div>
        
        {showOverlay && <TransOverlay />}
      </main>
    </div>
  );
}

export default App;