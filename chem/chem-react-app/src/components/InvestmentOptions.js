import React, { useState } from 'react';
import './InvestmentOptions.css';

function InvestmentCard({ option, onAllocate, budget }) {
  const [allocatedUnits, setAllocatedUnits] = useState(0);
  // Using id, name, description, cost from the passed option prop
  const { id, name, description, cost } = option;

  const handleAllocationChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) {
      value = 0;
    }
    // Prevent allocating more units than budget allows for this single item type
    // More complex global budget handling might be in GameScreen.js or via onAllocate validation
    if (cost * value > budget && budget >= 0) { // ensure budget is not negative before this check
        value = Math.floor(budget / cost);
    }
    setAllocatedUnits(value);
  };

  const handleAllocateClick = () => {
    // Double check budget before actually calling onAllocate
    if (cost * allocatedUnits > budget) {
      // This alert can be replaced with a nicer notification via a prop from GameScreen
      alert('Cannot allocate more than the remaining budget for this investment.');
      return;
    }
    if (allocatedUnits > 0) {
      onAllocate(id, allocatedUnits); // Pass ID and number of units
      setAllocatedUnits(0); // Reset after allocation for this card
    }
  };

  const totalCostForCurrentAllocation = cost * allocatedUnits;

  return (
    <div className="col-md-6 col-lg-4 mb-3 investment-option">
      <div className="card h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{name}</h5>
          <p className="card-text flex-grow-1">{description}</p>
          <p className="mb-1"><strong>Cost: ${cost}B per unit</strong></p>
          <div className="input-group mb-2">
            <span className="input-group-text">Units:</span>
            <input 
              type="number" 
              className="form-control"
              value={allocatedUnits}
              min="0"
              step="1" 
              onChange={handleAllocationChange}
              // disabled={budget <= 0} // Optionally disable if no budget at all
            />
          </div>
          <p className="mb-2"><strong>Total for this: ${totalCostForCurrentAllocation}B</strong></p>
          <button 
            className="btn btn-sm btn-outline-primary mt-auto" 
            onClick={handleAllocateClick}
            disabled={allocatedUnits === 0 || totalCostForCurrentAllocation === 0 || totalCostForCurrentAllocation > budget}
          >
            Allocate Funds
          </button>
        </div>
      </div>
    </div>
  );
}

function InvestmentOptions({ options, onInvest, budget, onConfirm }) {
  // Display a message if no options are available or if they are loading
  if (!options || options.length === 0) {
    return (
        <div className="tab-pane fade show active" id="investments-tab-pane" role="tabpanel" aria-labelledby="investments-tab-btn" tabIndex="0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Investment Options</h2>
                <div className="h5">Remaining Budget: <span className="fw-bold text-success">${budget}B</span></div>
            </div>
            <div className="row">
                 <div className="col-12">
                    <p className="text-muted">No investment options currently available for this turn.</p>
                 </div>
            </div>
            <div className="text-center mt-4">
                <button className="btn btn-primary" onClick={onConfirm} disabled>Confirm Investments</button>
            </div>
        </div>
    );
  }

  return (
    <div className="tab-pane fade show active" id="investments-tab-pane" role="tabpanel" aria-labelledby="investments-tab-btn" tabIndex="0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Investment Options</h2>
        <div className="h5">Remaining Budget: <span id="investments-budget-display" className="fw-bold text-success">${budget}B</span></div>
      </div>
      <div className="row" id="investments-container">
        {options.map(option => (
          <InvestmentCard 
            key={option.id} 
            option={option} 
            onAllocate={onInvest} 
            budget={budget} // Pass the remaining budget to each card for its own validation
          />
        ))}
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-primary" id="confirm-investments-btn" onClick={onConfirm} disabled={budget < 0}>
          Confirm Investments
        </button>
      </div>
    </div>
  );
}

export default InvestmentOptions;
