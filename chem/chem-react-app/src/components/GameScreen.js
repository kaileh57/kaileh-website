import React, { useState, useEffect } from 'react';
import ProgressTrack from './ProgressTrack';
import ResourceDisplay from './ResourceDisplay';
import Tabs from './Tabs';
import InvestmentOptions from './InvestmentOptions';
import PolicyOptions from './PolicyOptions';
import TurnSummary from './TurnSummary';
import './GameScreen.css'; // We'll create this CSS file next

// Initial Game State
const initialGameState = {
  currentYear: "2025-2030",
  currentTurn: 1,
  maxTurns: 5,
  score: 0,
  gameOver: false,
  gameOverReason: '',
  resources: {
    budget: { value: 100, max: 100, label: "Budget", unit: "B", available: 100, progressBarClass: "bg-success" },
    approval: { value: 65, max: 100, label: "Public Approval", unit: "%", progressBarClass: "bg-info" },
    gridStability: { value: 70, max: 100, label: "Grid Stability", unit: "%", progressBarClass: "bg-warning" },
    emissions: { value: 100, max: 100, label: "Emissions", unit: "%", progressBarClass: "bg-danger" }, // Lower is better
  },
  techLevels: {
    nuclear: 0,
    solar: 0,
    wind: 0,
    grid: 0,
    storage: 0
  },
  investmentsMade: {},
  policiesActive: [],
};

// Investments for each turn
const investments = {
  turn1: [
    {
      id: "nuclear_research_t1",
      name: "Nuclear Research Program",
      description: "Fund advanced research into next-generation nuclear technologies. Takes time to develop but offers long-term stability.",
      cost: 25,
      effects: (units) => ({ 
        techNuclear: 5 * units, 
        budget: -25 * units, 
        approval: -2 * units // Initial public hesitation
      })
    },
    {
      id: "solar_expansion_t1",
      name: "Solar Farm Expansion",
      description: "Invest in large-scale solar farms. Quick to deploy but intermittent power generation affects grid stability.",
      cost: 20,
      effects: (units) => ({ 
        techSolar: 5 * units, 
        gridStability: -3 * units, 
        emissions: -3 * units, 
        budget: -20 * units 
      })
    },
    {
      id: "wind_turbines_t1",
      name: "Wind Turbine Deployment",
      description: "Install new wind turbines in windy regions. Weather-dependent generation creates grid management challenges.",
      cost: 18,
      effects: (units) => ({ 
        techWind: 4 * units, 
        gridStability: -2 * units, 
        emissions: -2 * units, 
        budget: -18 * units 
      })
    }
  ],
  turn2: [
    {
      id: "nuclear_plant_planning_t2",
      name: "Nuclear Plant Planning",
      description: "Begin planning and site preparation for nuclear plants. Essential groundwork for future plants.",
      cost: 30,
      effects: (units) => ({ 
        techNuclear: 8 * units, 
        budget: -30 * units, 
        approval: 1 * units // Public starts seeing benefits
      })
    },
    {
      id: "battery_storage_t2",
      name: "Grid-Scale Battery Storage",
      description: "Deploy large battery arrays to support renewables. Expensive and requires maintenance.",
      cost: 25,
      effects: (units) => ({ 
        techStorage: 6 * units, 
        gridStability: 2 * units, 
        budget: -25 * units 
      })
    },
    {
      id: "grid_modernization_t2",
      name: "Smart Grid Implementation",
      description: "Upgrade transmission infrastructure with smart technologies. Costly but helps manage renewable variability.",
      cost: 22,
      effects: (units) => ({ 
        techGrid: 5 * units, 
        gridStability: 3 * units, 
        budget: -22 * units 
      })
    }
  ],
  turn3: [
    {
      id: "nuclear_construction_t3",
      name: "Nuclear Plant Construction",
      description: "Begin construction of modern nuclear plants. High upfront cost but will provide significant benefits when complete.",
      cost: 40,
      effects: (units) => ({ 
        techNuclear: 10 * units, 
        gridStability: 2 * units, // Starting to improve stability
        budget: -40 * units, 
        approval: 2 * units // Public support growing
      })
    },
    {
      id: "renewable_expansion_t3",
      name: "Massive Renewable Expansion",
      description: "Aggressive expansion of solar and wind. Quick emissions reduction but creates grid management challenges.",
      cost: 35,
      effects: (units) => ({ 
        techSolar: 4 * units, 
        techWind: 4 * units, 
        emissions: -6 * units, 
        gridStability: -5 * units, 
        budget: -35 * units 
      })
    },
    {
      id: "microgrid_deployment_t3",
      name: "Community Microgrid Program",
      description: "Fund local microgrids to reduce main grid pressure. Popular but limited overall impact.",
      cost: 15,
      effects: (units) => ({ 
        techGrid: 3 * units, 
        approval: 3 * units, 
        emissions: -1 * units, 
        budget: -15 * units 
      })
    }
  ],
  turn4: [
    {
      id: "nuclear_integration_t4",
      name: "Nuclear Grid Integration",
      description: "Connect new nuclear plants to the grid. Plants begin providing stable, emissions-free power.",
      cost: 30,
      effects: (units) => ({ 
        techNuclear: 6 * units, 
        gridStability: 8 * units, 
        emissions: -12 * units, 
        budget: -30 * units, 
        approval: 5 * units
      })
    },
    {
      id: "industrial_solar_t4",
      name: "Industrial Solar Mandate",
      description: "Require industries to install solar. Creates immediate emissions reduction but high costs hurt approval.",
      cost: 28,
      effects: (units) => ({ 
        techSolar: 7 * units, 
        emissions: -8 * units, 
        approval: -6 * units, 
        budget: -28 * units 
      })
    },
    {
      id: "advanced_grid_storage_t4",
      name: "Advanced Grid Storage",
      description: "Deploy next-generation storage technologies. Expensive but helps manage renewable intermittency.",
      cost: 35,
      effects: (units) => ({ 
        techStorage: 8 * units, 
        gridStability: 5 * units, 
        budget: -35 * units 
      })
    }
  ],
  turn5: [
    {
      id: "nuclear_fleet_t5",
      name: "Nuclear Fleet Expansion",
      description: "Complete and scale up nuclear power generation. Creates lasting grid stability and emissions reduction.",
      cost: 50,
      effects: (units) => ({ 
        techNuclear: 10 * units, 
        gridStability: 12 * units, 
        emissions: -15 * units, 
        budget: -50 * units, 
        approval: 8 * units
      })
    },
    {
      id: "renewable_subsidies_t5",
      name: "Massive Renewable Subsidies",
      description: "Pour funding into renewable deployment. Quick but inefficient emissions reduction that strains grid.",
      cost: 45,
      effects: (units) => ({ 
        techSolar: 8 * units, 
        techWind: 8 * units, 
        emissions: -10 * units, 
        gridStability: -7 * units, 
        budget: -45 * units 
      })
    },
    {
      id: "emergency_stabilization_t5",
      name: "Emergency Grid Stabilization",
      description: "Emergency measures to shore up grid reliability. Expensive stopgap solution.",
      cost: 40,
      effects: (units) => ({ 
        gridStability: 15 * units, 
        budget: -40 * units, 
        approval: -4 * units 
      })
    }
  ]
};

// Policies for all turns
const policies = [
  { 
    id: 'nuclear_incentives', 
    name: 'Nuclear Development Incentives', 
    description: 'Provide tax benefits and streamlined licensing for nuclear development.', 
    effects: { techNuclear: 3, gridStability: 1, budget: -5, approval: 2 } 
  },
  { 
    id: 'renewable_subsidies', 
    name: 'Renewable Energy Subsidies', 
    description: 'Subsidize solar and wind installations, popular but creates grid challenges.', 
    effects: { techSolar: 2, techWind: 2, gridStability: -2, emissions: -3, budget: -8, approval: 3 } 
  },
  { 
    id: 'carbon_tax', 
    name: 'Carbon Tax Implementation', 
    description: 'Tax carbon emissions across major industries. Effective but unpopular.', 
    effects: { emissions: -8, approval: -7, budget: 15 } 
  },
  { 
    id: 'energy_efficiency', 
    name: 'Energy Efficiency Standards', 
    description: 'Mandate higher efficiency for buildings and appliances. Modest impact.', 
    effects: { emissions: -2, approval: 1, budget: -2 } 
  },
  { 
    id: 'nuclear_research_grants', 
    name: 'Nuclear Research Grants', 
    description: 'Fund universities and labs for nuclear innovation. Long-term investment.', 
    effects: { techNuclear: 4, budget: -6 } 
  },
  { 
    id: 'grid_reliability_standards', 
    name: 'Grid Reliability Standards', 
    description: 'Require utilities to maintain higher reliability metrics. Controls renewable expansion.', 
    effects: { gridStability: 3, techGrid: 2, budget: -3, approval: -1 } 
  },
  { 
    id: 'public_nuclear_education', 
    name: 'Public Nuclear Education Program', 
    description: 'Launch campaign explaining nuclear safety and benefits. Improves public perception.', 
    effects: { approval: 5, budget: -4 } 
  },
  { 
    id: 'renewable_mandate', 
    name: 'Renewable Portfolio Standard', 
    description: 'Require utilities to source increasing percentages from renewables. Popular but stresses grid.', 
    effects: { emissions: -5, gridStability: -4, techSolar: 3, techWind: 3, approval: 4, budget: -3 } 
  }
];

function GameScreen({ showNotification }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [activeTab, setActiveTab] = useState('investments');
  const [currentInvestmentOptions, setCurrentInvestmentOptions] = useState([]);
  const [currentPolicyOptions, setCurrentPolicyOptions] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  // Effect for updating options based on the current turn
  useEffect(() => {
    updateInvestmentOptions(gameState.currentTurn);
    updatePolicyOptions();
    
    // Check for game over conditions
    checkGameOverConditions();
  }, [gameState.currentTurn]);

  const updateInvestmentOptions = (turn) => {
    switch(turn) {
      case 1:
        setCurrentInvestmentOptions(investments.turn1);
        break;
      case 2:
        setCurrentInvestmentOptions(investments.turn2);
        break;
      case 3:
        setCurrentInvestmentOptions(investments.turn3);
        break;
      case 4:
        setCurrentInvestmentOptions(investments.turn4);
        break;
      case 5:
        setCurrentInvestmentOptions(investments.turn5);
        break;
      default:
        setCurrentInvestmentOptions([]);
    }
  };

  const updatePolicyOptions = () => {
    // Get 4 random policies for each turn
    const shuffled = [...policies].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCurrentPolicyOptions(selected);
  };

  const checkGameOverConditions = () => {
    if (gameState.resources.approval.value < 50) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverReason: 'You have been fired due to low public approval!'
      }));
      showNotification('Game Over: Public approval fell below 50%!', 'danger');
    } else if (gameState.resources.gridStability.value < 20) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverReason: 'You have been fired due to grid collapse!'
      }));
      showNotification('Game Over: Grid stability fell below 20%!', 'danger');
    }
  };

  const handleInvestment = (investmentId, allocatedUnits) => {
    const investment = currentInvestmentOptions.find(inv => inv.id === investmentId);
    if (!investment) return;

    const totalCost = investment.cost * allocatedUnits;
    if (totalCost > gameState.resources.budget.available) {
      showNotification('Not enough budget for this allocation!', 'danger');
      return;
    }

    const effects = investment.effects(allocatedUnits);
    
    setGameState(prev => {
      const newResources = { ...prev.resources };
      const newTechLevels = { ...prev.techLevels };
      
      // Apply budget effect
      newResources.budget = {
        ...prev.resources.budget,
        value: Math.max(0, prev.resources.budget.value + (effects.budget || 0)),
        available: Math.max(0, prev.resources.budget.available + (effects.budget || 0))
      };
      
      // Apply other resource effects
      if (effects.gridStability) {
        newResources.gridStability = { 
          ...newResources.gridStability, 
          value: Math.min(100, Math.max(0, newResources.gridStability.value + effects.gridStability))
        };
      }
      
      if (effects.approval) {
        newResources.approval = { 
          ...newResources.approval, 
          value: Math.min(100, Math.max(0, newResources.approval.value + effects.approval))
        };
      }
      
      if (effects.emissions) {
        newResources.emissions = { 
          ...newResources.emissions, 
          value: Math.min(100, Math.max(0, newResources.emissions.value + effects.emissions))
        };
      }
      
      // Apply tech level effects
      if (effects.techNuclear) newTechLevels.nuclear += effects.techNuclear;
      if (effects.techSolar) newTechLevels.solar += effects.techSolar;
      if (effects.techWind) newTechLevels.wind += effects.techWind;
      if (effects.techGrid) newTechLevels.grid += effects.techGrid;
      if (effects.techStorage) newTechLevels.storage += effects.techStorage;

      return {
        ...prev,
        resources: newResources,
        techLevels: newTechLevels,
        investmentsMade: {
          ...prev.investmentsMade,
          [investmentId]: (prev.investmentsMade[investmentId] || 0) + allocatedUnits
        }
      };
    });

    showNotification(`${allocatedUnits} unit(s) of ${investment.name} funded. Cost: $${totalCost}B`, 'success');
  };

  const handlePolicySelection = (policyId) => {
    setSelectedPolicies(prev => {
      if (prev.includes(policyId)) {
        return prev.filter(id => id !== policyId);
      } else {
        if (prev.length < 2) { // Max 2 policies
          return [...prev, policyId];
        }
        showNotification('You can select a maximum of 2 policies per turn.', 'warning');
        return prev;
      }
    });
  };
  
  const confirmInvestments = () => {
    showNotification('Investments locked in for the turn.', 'success');
    setActiveTab('policies');
  };

  const confirmPolicies = () => {
    // Apply policy effects
    let effectsToApply = { 
      budget: 0, 
      approval: 0, 
      emissions: 0, 
      gridStability: 0,
      techNuclear: 0,
      techSolar: 0,
      techWind: 0,
      techGrid: 0,
      techStorage: 0
    };
    
    let policyNames = [];

    selectedPolicies.forEach(policyId => {
        const policy = currentPolicyOptions.find(p => p.id === policyId);
        if (policy) {
            policyNames.push(policy.name);
            Object.keys(policy.effects).forEach(key => {
                effectsToApply[key] = (effectsToApply[key] || 0) + policy.effects[key];
            });
        }
    });

    setGameState(prev => {
        const newResources = { ...prev.resources };
        const newTechLevels = { ...prev.techLevels };

        // Apply resource effects
        if (effectsToApply.budget) {
            newResources.budget = {
                 ...newResources.budget, 
                 value: Math.max(0, newResources.budget.value + effectsToApply.budget),
                 available: Math.max(0, newResources.budget.available + effectsToApply.budget) 
            };
        }
        
        if (effectsToApply.approval) {
            newResources.approval = { 
                ...newResources.approval, 
                value: Math.min(100, Math.max(0, newResources.approval.value + effectsToApply.approval)) 
            };
        }
        
        if (effectsToApply.emissions) {
            newResources.emissions = { 
                ...newResources.emissions, 
                value: Math.min(100, Math.max(0, newResources.emissions.value + effectsToApply.emissions)) 
            };
        }
        
        if (effectsToApply.gridStability) {
            newResources.gridStability = { 
                ...newResources.gridStability, 
                value: Math.min(100, Math.max(0, newResources.gridStability.value + effectsToApply.gridStability)) 
            };
        }
        
        // Apply tech level effects
        if (effectsToApply.techNuclear) newTechLevels.nuclear += effectsToApply.techNuclear;
        if (effectsToApply.techSolar) newTechLevels.solar += effectsToApply.techSolar;
        if (effectsToApply.techWind) newTechLevels.wind += effectsToApply.techWind;
        if (effectsToApply.techGrid) newTechLevels.grid += effectsToApply.techGrid;
        if (effectsToApply.techStorage) newTechLevels.storage += effectsToApply.techStorage;

        return {
            ...prev,
            resources: newResources,
            techLevels: newTechLevels,
            policiesActive: [...selectedPolicies]
        };
    });

    showNotification(`Policies confirmed: ${policyNames.join(', ') || 'None'}. Effects applied.`, 'success');
    setActiveTab('summary');
  };
  
  const calculateTurnEffects = () => {
    // Calculate effects from tech levels and other factors
    let stabilityChange = -8; // Increased from -5 to make it harder
    let emissionsChange = 0;
    let approvalChange = -5; // Increased from -2 to make it harder
    
    // Nuclear effects increase over time
    if (gameState.techLevels.nuclear >= 15) {
      stabilityChange += 4;
      emissionsChange -= 8;
      approvalChange += 3;
    } else if (gameState.techLevels.nuclear >= 10) {
      stabilityChange += 2;
      emissionsChange -= 5;
      approvalChange += 2;
    } else if (gameState.techLevels.nuclear >= 5) {
      stabilityChange += 1;
      emissionsChange -= 2;
      approvalChange += 1;
    }
    
    // Solar and wind provide some benefits but less than nuclear
    const renewableLevel = gameState.techLevels.solar + gameState.techLevels.wind;
    if (renewableLevel >= 30) {
      emissionsChange -= 6;
      // But high renewable without storage hurts stability
      if (gameState.techLevels.storage < 10) {
        stabilityChange -= 5; // Increased from -3
      }
    } else if (renewableLevel >= 15) {
      emissionsChange -= 3;
      if (gameState.techLevels.storage < 5) {
        stabilityChange -= 4; // Increased from -2
      }
    }
    
    // Grid improvements help stability
    if (gameState.techLevels.grid >= 10) {
      stabilityChange += 3;
    } else if (gameState.techLevels.grid >= 5) {
      stabilityChange += 1;
    }
    
    // Storage helps with stability
    if (gameState.techLevels.storage >= 10) {
      stabilityChange += 2;
    } else if (gameState.techLevels.storage >= 5) {
      stabilityChange += 1;
    }
    
    return { stabilityChange, emissionsChange, approvalChange };
  };
  
  const calculateScore = () => {
    // Calculate score based on emissions reduction, stability, and approval
    const emissionsScore = 100 - gameState.resources.emissions.value; // Lower emissions = higher score
    const stabilityScore = gameState.resources.gridStability.value;
    const approvalScore = gameState.resources.approval.value;
    
    // Nuclear focus bonus
    const nuclearBonus = gameState.techLevels.nuclear * 2;
    
    // Calculate final score
    const totalScore = emissionsScore * 2 + stabilityScore + approvalScore + nuclearBonus;
    
    return totalScore;
  };
  
  const endTurn = () => {
    if (gameState.currentTurn < gameState.maxTurns && !gameState.gameOver) {
      const { stabilityChange, emissionsChange, approvalChange } = calculateTurnEffects();
      
      setGameState(prev => {
        const nextTurn = prev.currentTurn + 1;
        const baseBudgetIncrease = 50;
        
        // Update resources with turn effects
        const newApproval = Math.min(100, Math.max(0, prev.resources.approval.value + approvalChange));
        const newStability = Math.min(100, Math.max(0, prev.resources.gridStability.value + stabilityChange));
        const newEmissions = Math.min(100, Math.max(0, prev.resources.emissions.value + emissionsChange));
        
        // Calculate score
        const turnScore = calculateScore();

        return {
          ...prev,
          currentTurn: nextTurn,
          currentYear: `${2025 + (nextTurn-1) * 5}-${2030 + (nextTurn-1) * 5}`,
          score: turnScore,
          resources: {
            ...prev.resources,
            budget: { 
              ...prev.resources.budget, 
              value: prev.resources.budget.value + baseBudgetIncrease, 
              available: prev.resources.budget.value + baseBudgetIncrease
            },
            approval: { ...prev.resources.approval, value: newApproval },
            gridStability: { ...prev.resources.gridStability, value: newStability },
            emissions: { ...prev.resources.emissions, value: newEmissions },
          },
          investmentsMade: {},
        };
      });
      
      setSelectedPolicies([]);
      setActiveTab('investments');
      
      // Check game over conditions after state update
      setTimeout(() => checkGameOverConditions(), 100);
      
    } else if (gameState.currentTurn >= gameState.maxTurns && !gameState.gameOver) {
      // Game completed - calculate final score
      const finalScore = calculateScore();
      
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        score: finalScore,
        gameOverReason: 'You have completed your 5-year energy policy plan!'
      }));
      
      showNotification(`Game Complete! Final Score: ${finalScore}`, 'success');
    }
  };

  const tabContents = {
    investments: (
      <InvestmentOptions 
        options={currentInvestmentOptions} 
        onInvest={handleInvestment} 
        budget={gameState.resources.budget.available}
        onConfirm={confirmInvestments} 
      />
    ),
    policies: (
      <PolicyOptions 
        options={currentPolicyOptions} 
        selectedPolicies={selectedPolicies}
        onSelectPolicy={handlePolicySelection} 
        onConfirm={confirmPolicies}
      />
    ),
    summary: (
      <TurnSummary 
        gameState={gameState} 
        onEndTurn={endTurn} 
        techLevels={gameState.techLevels}
        score={gameState.score}
      />
    ),
  };

  return (
    <div className="screen active" id="game-screen">
      <div className="d-flex justify-content-between align-items-center mt-0 mb-3 px-3 pb-3 rounded">
        <div className="h3 mb-0" id="current-year">{gameState.currentYear}</div>
        <div className="h5 mb-0">Turn <span id="current-turn">{gameState.currentTurn}</span> of {gameState.maxTurns}</div>
      </div>

      <ProgressTrack currentTurn={gameState.currentTurn} maxTurns={gameState.maxTurns} />

      <div className="row g-3 mb-4">
        {Object.entries(gameState.resources).map(([key, resource]) => (
          <ResourceDisplay key={key} resource={resource} />
        ))}
      </div>
      
      <div className="mb-3 text-center">
        <h4>Score: {gameState.score}</h4>
        {gameState.gameOver && (
          <div className="alert alert-warning">
            {gameState.gameOverReason}
          </div>
        )}
      </div>
      
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} disabled={gameState.gameOver} />
      <div className="tab-content" id="game-tabs-content">
        {gameState.gameOver ? (
          <div className="p-4">
            <h3>{gameState.gameOverReason.includes("fired") ? "You Were Fired!" : "Game Summary"}</h3>
            
            {gameState.gameOverReason.includes("fired") && (
              <div className="alert alert-danger mb-4">
                <h4 className="alert-heading">Termination Notice</h4>
                <p><strong>Reason:</strong> {gameState.gameOverReason}</p>
                <hr />
                <p className="mb-0">
                  {gameState.resources.approval.value < 50 
                    ? "The public has lost confidence in your leadership. Your energy policies have become too unpopular to continue."
                    : "The power grid has become unstable under your leadership, resulting in widespread blackouts and economic damage."}
                </p>
              </div>
            )}
            
            <p>Final Score: {gameState.score}</p>
            
            <h4>Technology Levels Achieved:</h4>
            <ul>
              <li>Nuclear: {gameState.techLevels.nuclear}</li>
              <li>Solar: {gameState.techLevels.solar}</li>
              <li>Wind: {gameState.techLevels.wind}</li>
              <li>Grid Technology: {gameState.techLevels.grid}</li>
              <li>Storage: {gameState.techLevels.storage}</li>
            </ul>
            <p>Emissions Reduced: {100 - gameState.resources.emissions.value}%</p>
            <p>Final Grid Stability: {gameState.resources.gridStability.value}%</p>
            <p>Final Public Approval: {gameState.resources.approval.value}%</p>
            
            {gameState.gameOverReason.includes("fired") && (
              <div className="mt-4">
                <h4>Post-Mortem Analysis</h4>
                <p>
                  {gameState.techLevels.nuclear < 10 
                    ? "Your failure to adequately develop nuclear energy created an unstable energy mix that couldn't meet the nation's needs."
                    : "Despite some progress with nuclear energy, your policies failed to achieve the right balance of public support and grid reliability."}
                </p>
                <p>Remember: A stable energy future requires solid planning and strategic investment in reliable baseload power.</p>
              </div>
            )}
          </div>
        ) : (
          tabContents[activeTab]
        )}
      </div>
    </div>
  );
}

export default GameScreen;
