import React from 'react';

function ResearchTree({ researchProgress, techLevels, onResearchSelect }) {
  // Group research items by category
  const categories = {
    nuclear: ['advancedNuclear', 'smallModularReactors', 'fusionResearch'],
    renewable: ['nextGenSolar', 'offshoreWind'],
    infrastructure: ['smartGrid']
  };

  const formatResearchName = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getTechLevelBonus = (researchKey) => {
    // Calculate tech level bonuses that affect research
    if (researchKey.includes('Nuclear')) {
      return techLevels.nuclear >= 10 ? 1 : 0;
    } else if (researchKey.includes('Solar')) {
      return techLevels.solar >= 10 ? 1 : 0;
    } else if (researchKey.includes('Wind')) {
      return techLevels.wind >= 10 ? 1 : 0;
    } else if (researchKey.includes('Grid')) {
      return techLevels.grid >= 10 ? 1 : 0;
    }
    return 0;
  };

  return (
    <div className="research-tree">
      <h4 className="mb-4">Research & Development</h4>
      
      <div className="tech-levels mb-4">
        <h5>Current Technology Levels</h5>
        <div className="row">
          <div className="col-md-4 mb-2">
            <div className="card">
              <div className="card-body text-center">
                <h6>Nuclear</h6>
                <h2>{techLevels.nuclear}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card">
              <div className="card-body text-center">
                <h6>Solar</h6>
                <h2>{techLevels.solar}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card">
              <div className="card-body text-center">
                <h6>Wind</h6>
                <h2>{techLevels.wind}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="card">
              <div className="card-body text-center">
                <h6>Grid Technology</h6>
                <h2>{techLevels.grid}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="card">
              <div className="card-body text-center">
                <h6>Energy Storage</h6>
                <h2>{techLevels.storage}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="research-categories">
        {Object.entries(categories).map(([category, researchKeys]) => (
          <div key={category} className="mb-4">
            <h5 className="category-header">
              {category.charAt(0).toUpperCase() + category.slice(1)} Research
            </h5>
            <div className="row">
              {researchKeys.map(key => {
                const research = researchProgress[key];
                if (!research) return null;
                
                const techBonus = getTechLevelBonus(key);
                
                return (
                  <div className="col-md-4 mb-3" key={key}>
                    <div className={`card research-card ${research.unlocked ? 'border-success' : ''}`}>
                      <div className="card-header">
                        <h6 className="mb-0">{formatResearchName(key)}</h6>
                      </div>
                      <div className="card-body">
                        <p className="card-text small">{research.description}</p>
                        <div className="progress mb-2">
                          <div 
                            className={`progress-bar ${research.unlocked ? 'bg-success' : 'bg-info'}`} 
                            role="progressbar" 
                            style={{width: `${Math.min(100, (research.level / 3) * 100)}%`}}
                            aria-valuenow={research.level} 
                            aria-valuemin="0" 
                            aria-valuemax="3">
                            {research.level}/3
                          </div>
                        </div>
                        
                        {techBonus > 0 && (
                          <div className="alert alert-info p-1 small">
                            +{techBonus} from technology level
                          </div>
                        )}
                        
                        <div className="text-center mt-2">
                          {research.unlocked ? (
                            <span className="badge bg-success">Unlocked</span>
                          ) : (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onResearchSelect(key)}
                              disabled={research.level >= 3}
                            >
                              Focus Research
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        <i className="bi bi-lightbulb me-2"></i>
        Research can unlock new capabilities and special projects. Invest in relevant technologies to unlock advanced research options.
      </div>
    </div>
  );
}

export default ResearchTree; 