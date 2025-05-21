import React from 'react';
// We might not need a separate CSS file if Bootstrap handles all styling
// import './ResourceDisplay.css'; 

function ResourceDisplay({ resource }) {
  const { label, value, unit, max, progressBarClass, available } = resource;
  const percentage = max ? (value / max) * 100 : 0;

  return (
    <div className="col-md-6 col-lg-3">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="card-title h6 mb-0">{label}</span>
            <span className="fw-bold">{value}{unit}</span>
          </div>
          {max && (
            <div className="progress mb-2" style={{ height: '10px' }}>
              <div 
                className={`progress-bar ${progressBarClass || 'bg-secondary'}`} 
                role="progressbar" 
                style={{ width: `${percentage}%` }} 
                aria-valuenow={value} 
                aria-valuemin="0" 
                aria-valuemax={max}
              ></div>
            </div>
          )}
          {available !== undefined && (
            <small className="text-muted">Available: ${available}{unit}</small>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceDisplay;
