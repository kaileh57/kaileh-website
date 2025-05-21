import React from 'react';

function RegionSelector({ regions, currentRegion, onRegionSelect }) {
  return (
    <div className="region-selector">
      <h5 className="mb-3">Select Region to Focus On</h5>
      <div className="row">
        {regions.map(region => (
          <div className="col-md-6 mb-3" key={region.id}>
            <div 
              className={`card region-card ${region.id === currentRegion ? 'border-primary' : ''}`}
              onClick={() => onRegionSelect(region.id)}
              style={{cursor: 'pointer'}}
            >
              <div className="card-body">
                <h5 className="card-title">{region.name}</h5>
                <p className="card-text">{region.description}</p>
                <div className="region-stats mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Energy Demand:</span>
                    <div className="progress flex-grow-1 mx-2" style={{height: '20px'}}>
                      <div 
                        className="progress-bar bg-warning" 
                        role="progressbar" 
                        style={{width: `${region.energyDemand}%`}}
                        aria-valuenow={region.energyDemand} 
                        aria-valuemin="0" 
                        aria-valuemax="100">
                        {region.energyDemand}%
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Solar Viability:</span>
                    <div className="progress flex-grow-1 mx-2" style={{height: '20px'}}>
                      <div 
                        className="progress-bar bg-warning" 
                        role="progressbar" 
                        style={{width: `${region.solarViability}%`}}
                        aria-valuenow={region.solarViability} 
                        aria-valuemin="0" 
                        aria-valuemax="100">
                        {region.solarViability}%
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Wind Viability:</span>
                    <div className="progress flex-grow-1 mx-2" style={{height: '20px'}}>
                      <div 
                        className="progress-bar bg-info" 
                        role="progressbar" 
                        style={{width: `${region.windViability}%`}}
                        aria-valuenow={region.windViability} 
                        aria-valuemin="0" 
                        aria-valuemax="100">
                        {region.windViability}%
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Nuclear Suitability:</span>
                    <div className="progress flex-grow-1 mx-2" style={{height: '20px'}}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{width: `${region.nuclearSuitability}%`}}
                        aria-valuenow={region.nuclearSuitability} 
                        aria-valuemin="0" 
                        aria-valuemax="100">
                        {region.nuclearSuitability}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {region.id === currentRegion ? (
                  <div className="text-center">
                    <span className="badge bg-primary">Currently Selected</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onRegionSelect(region.id)}
                    >
                      Select Region
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="alert alert-info mt-3">
        <i className="bi bi-info-circle me-2"></i>
        Different regions have different characteristics that affect how effective your policies will be. 
        Choose regions strategically based on their suitability for your energy strategy.
      </div>
    </div>
  );
}

export default RegionSelector; 