import React from 'react';
import './TurnSummary.css'; // We'll create this CSS file next

function TurnSummary({ gameState, onEndTurn, techLevels, score }) {
  const { resources, investmentsMade, policiesActive, currentTurn, maxTurns } = gameState;

  // Helper to format names from camelCase (e.g., techSolar -> Solar)
  const formatDisplayName = (key) => {
    if (key === 'budget') return 'Budget';
    if (key === 'approval') return 'Public Approval';
    if (key === 'gridStability') return 'Grid Stability';
    if (key === 'emissions') return 'Emissions';
    if (key === 'nuclear') return 'Nuclear';
    if (key === 'solar') return 'Solar';
    if (key === 'wind') return 'Wind';
    if (key === 'grid') return 'Grid Technology';
    if (key === 'storage') return 'Energy Storage';
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Format investment ID to user-friendly name
  const formatInvestmentName = (investmentId) => {
    // Replace underscores with spaces and capitalize each word
    return investmentId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/T\d/, ''); // Remove turn indicators like T1, T2
  };

  // Format policy ID to user-friendly name
  const formatPolicyName = (policyId) => {
    // Replace underscores with spaces and capitalize each word
    return policyId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="tab-pane fade show active" id="summary-tab-pane" role="tabpanel" aria-labelledby="summary-tab-btn" tabIndex="0">
      <h2>Turn {currentTurn} Summary</h2>
      <p>Review your decisions and their outcomes before proceeding to the next turn or concluding the game.</p>

      <div className="row">
        {/* Resources Summary */}
        <div className="col-md-6">
          <div className="card summary-card mb-3">
            <div className="card-header">Current Resources</div>
            <div className="card-body">
              {Object.entries(resources).map(([key, res]) => (
                <div className="summary-row" key={key}>
                  <div>{res.label || formatDisplayName(key)}:</div>
                  <div>{res.value}{res.unit} {res.available !== undefined ? `(Available: $${res.available}${res.unit})` : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Levels Summary */}
          <div className="card summary-card mb-3">
            <div className="card-header">Technology Levels</div>
            <div className="card-body">
              {techLevels && Object.keys(techLevels).length > 0 ? (
                Object.entries(techLevels).map(([key, level]) => (
                  <div className="summary-row" key={key}>
                    <div>{formatDisplayName(key)}:</div>
                    <div>{level}</div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No technology levels to display.</p>
              )}
            </div>
          </div>
        </div>

        {/* Decisions Made Summary */}
        <div className="col-md-6">
          <div className="card summary-card mb-3">
            <div className="card-header">Investments This Turn</div>
            <div className="card-body">
              {Object.keys(investmentsMade).length > 0 ? (
                Object.entries(investmentsMade).map(([id, units]) => (
                  <div className="summary-item" key={id}>{formatInvestmentName(id)}: {units} unit(s)</div>
                ))
              ) : (
                <p className="text-muted">No new investments made this turn.</p>
              )}
            </div>
          </div>

          <div className="card summary-card mb-3">
            <div className="card-header">Policies Enacted This Turn</div>
            <div className="card-body">
              {policiesActive && policiesActive.length > 0 ? (
                policiesActive.map(policyId => (
                  <div className="summary-item" key={policyId}>{formatPolicyName(policyId)}</div>
                ))
              ) : (
                <p className="text-muted">No new policies enacted this turn.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        {score !== undefined && (
          <div className="mb-3">
            <h4>Current Score: {score}</h4>
          </div>
        )}
        <button className="btn btn-primary btn-lg" onClick={onEndTurn}>
          {currentTurn < maxTurns ? `End Turn ${currentTurn} & Proceed to Next` : 'Finish Game & View Results'}
        </button>
      </div>
    </div>
  );
}

export default TurnSummary;
