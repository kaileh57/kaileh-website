import React from 'react';
import './TurnSummary.css'; // We'll create this CSS file next

function TurnSummary({ gameState, onEndTurn, techLevels, score, nuclearProjects, globalTemperature }) {
  const { resources, investmentsMade, policiesActive, currentTurn, maxTurns } = gameState;
  const activeNuclearProjects = nuclearProjects?.filter(p => p.currentPhase < p.duration) || [];
  const completedNuclearProjects = nuclearProjects?.filter(p => p.currentPhase >= p.duration) || [];

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
                  <div>{Math.round(res.value)}{res.unit} {res.available !== undefined ? `(Available: $${Math.round(res.available)}${res.unit})` : ''}</div>
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
                    <div>{Math.round(level)}</div>
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
                  <div className="summary-item" key={id}>{formatInvestmentName(id)}: {Math.round(units)} unit(s)</div>
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

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Current Score</h5>
            </div>
            <div className="card-body text-center">
              <h2 className="display-4">{Math.round(score)}</h2>
              <p>Your policy effectiveness rating</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Climate Status</h5>
            </div>
            <div className="card-body text-center">
              <h2 className="display-4">+{(Math.round((globalTemperature || 1.0) * 10) / 10).toFixed(1)}°C</h2>
              <p className={globalTemperature > 2.0 ? "text-danger" : globalTemperature > 1.5 ? "text-warning" : "text-success"}>
                {globalTemperature > 2.0 ? "Critical" : globalTemperature > 1.5 ? "Concerning" : "Manageable"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Energy Mix</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Nuclear:</span>
                <strong>{Math.round((techLevels.nuclear / (techLevels.nuclear + techLevels.solar + techLevels.wind)) * 100) || 0}%</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Solar:</span>
                <strong>{Math.round((techLevels.solar / (techLevels.nuclear + techLevels.solar + techLevels.wind)) * 100) || 0}%</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Wind:</span>
                <strong>{Math.round((techLevels.wind / (techLevels.nuclear + techLevels.solar + techLevels.wind)) * 100) || 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Technology Levels</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <h6>Nuclear: {Math.round(techLevels.nuclear)}</h6>
                  <div className="progress" style={{height: '25px'}}>
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{width: `${Math.min(100, (techLevels.nuclear / 30) * 100)}%`}}
                      aria-valuenow={Math.round(techLevels.nuclear)} 
                      aria-valuemin="0" 
                      aria-valuemax="30">
                      {Math.round(techLevels.nuclear)}
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <h6>Solar: {Math.round(techLevels.solar)}</h6>
                  <div className="progress" style={{height: '25px'}}>
                    <div 
                      className="progress-bar bg-warning" 
                      role="progressbar" 
                      style={{width: `${Math.min(100, (techLevels.solar / 30) * 100)}%`}}
                      aria-valuenow={Math.round(techLevels.solar)} 
                      aria-valuemin="0" 
                      aria-valuemax="30">
                      {Math.round(techLevels.solar)}
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <h6>Wind: {Math.round(techLevels.wind)}</h6>
                  <div className="progress" style={{height: '25px'}}>
                    <div 
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{width: `${Math.min(100, (techLevels.wind / 30) * 100)}%`}}
                      aria-valuenow={Math.round(techLevels.wind)} 
                      aria-valuemin="0" 
                      aria-valuemax="30">
                      {Math.round(techLevels.wind)}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>Grid Technology: {Math.round(techLevels.grid)}</h6>
                  <div className="progress" style={{height: '25px'}}>
                    <div 
                      className="progress-bar bg-secondary" 
                      role="progressbar" 
                      style={{width: `${Math.min(100, (techLevels.grid / 20) * 100)}%`}}
                      aria-valuenow={Math.round(techLevels.grid)} 
                      aria-valuemin="0" 
                      aria-valuemax="20">
                      {Math.round(techLevels.grid)}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>Storage: {Math.round(techLevels.storage)}</h6>
                  <div className="progress" style={{height: '25px'}}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{width: `${Math.min(100, (techLevels.storage / 20) * 100)}%`}}
                      aria-valuenow={Math.round(techLevels.storage)} 
                      aria-valuemin="0" 
                      aria-valuemax="20">
                      {Math.round(techLevels.storage)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nuclear Projects Section */}
      {(activeNuclearProjects.length > 0 || completedNuclearProjects.length > 0) && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Nuclear Projects</h5>
              </div>
              <div className="card-body">
                {activeNuclearProjects.length > 0 && (
                  <div className="active-projects mb-3">
                    <h6>Active Projects</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Region</th>
                            <th>Progress</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeNuclearProjects.map(project => {
                            const progressPercent = Math.round((project.currentPhase / project.duration) * 100);
                            return (
                              <tr key={project.id}>
                                <td>{project.name}</td>
                                <td>{project.regionId}</td>
                                <td>
                                  <div className="progress" style={{height: '20px'}}>
                                    <div 
                                      className="progress-bar bg-primary" 
                                      role="progressbar" 
                                      style={{width: `${progressPercent}%`}}
                                      aria-valuenow={progressPercent} 
                                      aria-valuemin="0" 
                                      aria-valuemax="100">
                                      {progressPercent}%
                                    </div>
                                  </div>
                                </td>
                                <td>Phase {project.currentPhase + 1} of {project.duration}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {completedNuclearProjects.length > 0 && (
                  <div className="completed-projects">
                    <h6>Completed Projects</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Region</th>
                            <th>Benefits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedNuclearProjects.map(project => (
                            <tr key={project.id}>
                              <td>{project.name}</td>
                              <td>{project.regionId}</td>
                              <td>
                                {Object.entries(project.effects.onComplete)
                                  .map(([key, value]) => `${key}: ${value > 0 ? '+' : ''}${Math.round(value)}`)
                                  .join(', ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Research Breakthroughs */}
      {gameState && gameState.researchProgress && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Research Breakthroughs</h5>
              </div>
              <div className="card-body">
                {Object.entries(gameState.researchProgress)
                  .filter(([_, research]) => research.unlocked)
                  .map(([key, research]) => (
                    <div key={key} className="alert alert-success mb-2">
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</strong>: {research.description}
                    </div>
                  ))}
                
                {Object.values(gameState.researchProgress).every(r => !r.unlocked) && (
                  <div className="alert alert-secondary">
                    No research breakthroughs yet. Invest in technology to advance research.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="mb-3">Ready to advance to the next 5-year period?</h5>
              <button className="btn btn-lg btn-primary" onClick={onEndTurn}>
                End Turn and Advance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurnSummary;
