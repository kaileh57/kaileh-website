import React from 'react';
import './LoadingOverlay.css'; // We'll create this CSS file next

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loader"></div>
    </div>
  );
}

export default LoadingOverlay;
