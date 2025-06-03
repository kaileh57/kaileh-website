import React from 'react';
import './PolicyOptions.css'; // We'll create this CSS file next

function PolicyCard({ option, onSelect, isSelected }) {
  const { id, name, description, effects } = option; // Assuming these fields

  // Create a summary of effects to display
  const effectsSummary = Object.entries(effects)
    .map(([key, value]) => {
      let effectText = value > 0 ? `+${value}` : `${value}`;
      // You might want to map 'key' to a more readable name if needed
      // e.g., techSolar -> "Solar Tech", gridStability -> "Grid Stability"
      let readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      if (key === 'budget' || key === 'cost') readableKey += " (B)"; // Assuming Billions
      else if (key !== 'emissions' && key !== 'approval') readableKey += " (%)"; // Assuming % for others
      else if (key === 'emissions' || key === 'approval') readableKey += " (% pts)";

      return `${readableKey}: ${effectText}`;
    })
    .join(', ');

  return (
    <div className="col-md-6 mb-3 policy-option">
      <div className={`card h-100 ${isSelected ? 'border-primary shadow' : ''}`}>
        <div className="card-body">
          <div className="form-check">
            <input 
              className="form-check-input policy-checkbox" 
              type="checkbox" 
              value={id} 
              id={`policyCheck-${id}`}
              checked={isSelected}
              onChange={() => onSelect(id)}
            />
            <label className="form-check-label w-100" htmlFor={`policyCheck-${id}`}>
              <h5 className="card-title mb-1">{name}</h5>
            </label>
          </div>
          <p className="card-text mt-2">{description}</p>
          <small className="text-muted">Effects: {effectsSummary}</small>
        </div>
      </div>
    </div>
  );
}

function PolicyOptions({ options, selectedPolicies, onSelectPolicy, onConfirm }) {
  if (!options || options.length === 0) {
    return (
        <div className="tab-pane fade show active" id="policies-tab-pane" role="tabpanel" aria-labelledby="policies-tab-btn" tabIndex="0">
            <h2>Policy Options</h2>
            <p className="text-muted">Select up to two policies to implement during this turn.</p>
            <div className="row">
                <div className="col-12">
                    <p className="text-muted">No policy options currently available.</p>
                </div>
            </div>
            <div className="text-center mt-4">
                <button className="btn btn-primary" onClick={onConfirm} disabled>Confirm Policies</button>
            </div>
        </div>
    );
  }
  
  return (
    <div className="tab-pane fade show active" id="policies-tab-pane" role="tabpanel" aria-labelledby="policies-tab-btn" tabIndex="0">
      <h2>Policy Options</h2>
      <p className="text-muted">Select up to two policies to implement during this turn. (Selected: {selectedPolicies.length}/2)</p>
      <div className="row" id="policies-container">
        {options.map(option => (
          <PolicyCard 
            key={option.id} 
            option={option} 
            onSelect={onSelectPolicy} 
            isSelected={selectedPolicies.includes(option.id)}
          />
        ))}
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-primary" id="confirm-policies-btn" onClick={onConfirm}>
          Confirm Policies
        </button>
      </div>
    </div>
  );
}

export default PolicyOptions;
