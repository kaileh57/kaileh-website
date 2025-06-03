import React from 'react';
import './ProgressTrack.css'; // We'll create this CSS file next

function ProgressTrack({ currentTurn, maxTurns }) {
  const steps = [];
  for (let i = 1; i <= maxTurns; i++) {
    steps.push({
      number: i,
      label: `${2025 + (i-1)*5}-${2030 + (i-1)*5}`,
      active: i === currentTurn,
    });
  }

  return (
    <div className="progress-track-container mb-4">
      <div className="progress-track">
        {steps.map((step) => (
          <div key={step.number} className={`progress-step ${step.active ? 'active' : ''}`} data-step={step.number}>
            {step.number}
            <div className="progress-label">{step.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressTrack;
