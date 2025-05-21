import React from 'react';
import './TurnSummary.css'; // We'll create this CSS file next

function TurnSummary({ gameState, onEndTurn }) {
  const { resources, techLevels, investmentsMade, policiesActive, currentTurn, maxTurns } = gameState;

  // Helper to format names from camelCase (e.g., techSolar -> Solar)
  const formatDisplayName = (key) => {
    if (key === 'budget') return 'Budget';
    if (key === 'approval') return 'Public Approval';
    if (key === 'gridStability') return 'Grid Stability';
    if (key === 'emissions') return 'Emissions';
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
              {Object.entries(techLevels).map(([key, tech]) => (
                <div className="summary-row" key={key}>
                  <div>{tech.label || formatDisplayName(key)}:</div>
                  <div>{tech.value}%</div>
                </div>
              ))}
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
                  <div className="summary-item" key={id}>{formatDisplayName(id.replace("usa_","").replace("_t1",""))}: {units} unit(s)</div>
                  // TODO: Get investment name from a lookup for better display
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
                  // TODO: Get policy name from a lookup for better display
                  <div className="summary-item" key={policyId}>{formatDisplayName(policyId.replace("_1",""))}</div>
                ))
              ) : (
                <p className="text-muted">No new policies enacted this turn.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-primary btn-lg" onClick={onEndTurn}>
          {currentTurn < maxTurns ? `End Turn ${currentTurn} & Proceed to Next` : 'Finish Game & View Results'}
        </button>
      </div>
    </div>
  );
}

export default TurnSummary;
