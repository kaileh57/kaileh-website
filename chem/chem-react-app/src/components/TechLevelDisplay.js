import React from 'react';
// import './TechLevelDisplay.css'; // May not be needed if GameScreen.css or Bootstrap covers it

function TechLevelDisplay({ tech }) {
  const { label, value } = tech;
  const percentage = value; // Assuming value is already a percentage

  // Define a mapping for progress bar colors or use a default
  const techColorMapping = {
    Solar: 'bg-warning', // Example color
    Wind: 'bg-info',
    Storage: 'bg-success',
    Nuclear: 'bg-danger',
    Grid: 'bg-primary',
  };
  const progressBarClass = techColorMapping[label] || 'bg-secondary';

  return (
    <div className="col-md">
      <div>{label}</div>
      <div className="progress"> {/* tech-levels class is on the parent in GameScreen.js */}
        <div 
          className={`progress-bar ${progressBarClass}`} 
          role="progressbar" 
          style={{ width: `${percentage}%` }} 
          aria-valuenow={percentage} 
          aria-valuemin="0" 
          aria-valuemax="100"
        ></div>
      </div>
      <div className="text-end small">{percentage}%</div>
    </div>
  );
}

export default TechLevelDisplay;
