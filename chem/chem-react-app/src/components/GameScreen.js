import React, { useState, useEffect } from 'react';
import ProgressTrack from './ProgressTrack';
import ResourceDisplay from './ResourceDisplay';
import Tabs from './Tabs';
import InvestmentOptions from './InvestmentOptions';
import PolicyOptions from './PolicyOptions';
import TurnSummary from './TurnSummary';
import './GameScreen.css'; // We'll create this CSS file next

// Initial Game State (can be moved to a separate file or context later)
const initialGameState = {
  currentYear: "2025-2030",
  currentTurn: 1,
  maxTurns: 5,
  resources: {
    budget: { value: 100, max: 100, label: "Budget", unit: "B", available: 100, progressBarClass: "bg-success" },
    approval: { value: 65, max: 100, label: "Public Approval", unit: "%", progressBarClass: "bg-info" },
    gridStability: { value: 70, max: 100, label: "Grid Stability", unit: "%", progressBarClass: "bg-warning" },
    emissions: { value: 100, max: 100, label: "Emissions", unit: "%", progressBarClass: "bg-danger" }, // Lower is better, visually might need adjustment
  },
  investmentsMade: {}, // To track how many units of each investment
  policiesActive: [], // To track active policies
};

// Sample USA Investments - we can expand this based on your game's needs
const usaInvestments_turn1 = [
  {
    id: "usa_solar_expansion_t1",
    name: "Solar Farm Expansion (Southwest)",
    description: "Invest in large-scale solar farms in the sunny Southwest. High potential but requires grid upgrades.",
    cost: 20, // Cost per unit/level of investment
    effects: (units) => ({ techSolar: 5 * units, gridStability: -2 * units, budget: -20 * units })
  },
  {
    id: "usa_wind_turbines_midwest_t1",
    name: "Wind Turbine Deployment (Midwest)",
    description: "Install new wind turbines in the Great Plains. Good synergy with existing grid.",
    cost: 15,
    effects: (units) => ({ techWind: 4 * units, gridStability: 1 * units, budget: -15 * units })
  },
  {
    id: "usa_grid_modernization_t1",
    name: "National Grid Modernization",
    description: "Upgrade transmission lines and implement smart grid technologies nationwide.",
    cost: 30,
    effects: (units) => ({ techGrid: 6 * units, gridStability: 3 * units, budget: -30 * units })
  },
  {
    id: "usa_battery_storage_research_t1",
    name: "Battery Storage Research Grant",
    description: "Fund R&D for next-generation battery storage to improve renewable integration.",
    cost: 10,
    effects: (units) => ({ techStorage: 3 * units, budget: -10 * units })
  }
];

// Sample USA Policies
const usaPolicies_all = [
    { id: 'renewable_subsidy_1', name: 'Renewable Energy Subsidies', description: 'Provide tax credits and subsidies for solar and wind installations.', effects: { techSolar: 2, techWind: 2, budget: -5, approval: 1 } },
    { id: 'carbon_tax_1', name: 'Moderate Carbon Tax', description: 'Implement a modest tax on carbon emissions across major industries.', effects: { emissions: -5, approval: -3, budget: 10} },
    { id: 'energy_efficiency_mandate_1', name: 'Appliance Efficiency Standards', description: 'Mandate higher energy efficiency for new appliances.', effects: { emissions: -2, approval: 1 } },
];

function GameScreen({ showNotification }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [activeTab, setActiveTab] = useState('investments'); // 'investments', 'policies', 'summary'

  // For now, we'll use a static list based on the current turn
  // In a more complex setup, this would filter from a larger list
  const [currentInvestmentOptions, setCurrentInvestmentOptions] = useState(usaInvestments_turn1);
  const [currentPolicyOptions, setCurrentPolicyOptions] = useState(usaPolicies_all); // Show all policies for now

  // Effect for updating options based on the current turn
  useEffect(() => {
    // Potentially load different investments/policies based on gameState.currentTurn here
    if (gameState.currentTurn === 1) {
        setCurrentInvestmentOptions(usaInvestments_turn1);
    } else if (gameState.currentTurn === 2) {
        // Example: Load different investments for turn 2
        // setCurrentInvestmentOptions(usaInvestments_turn2);
        // setCurrentPolicyOptions(usaPolicies_turn2);
        setCurrentInvestmentOptions([]); // Placeholder for now
    }
    // Add more conditions for other turns
  }, [gameState.currentTurn]);

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
      newResources.budget = {
        ...prev.resources.budget,
        value: prev.resources.budget.value - totalCost,
        available: prev.resources.budget.available - totalCost
      };
      
      if (effects.gridStability) newResources.gridStability = { ...newResources.gridStability, value: Math.min(100, Math.max(0, newResources.gridStability.value + effects.gridStability)) };
      // Ensure budget doesn't go below zero from investment directly (though available should prevent this)
      newResources.budget.value = Math.max(0, newResources.budget.value);

      return {
        ...prev,
        resources: newResources,
        investmentsMade: {
          ...prev.investmentsMade,
          [investmentId]: (prev.investmentsMade[investmentId] || 0) + allocatedUnits
        }
      };
    });

    showNotification(`${allocatedUnits} unit(s) of ${investment.name} funded. Cost: $${totalCost}B`, 'success');
  };

  const [selectedPolicies, setSelectedPolicies] = useState([]);

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
    let effectsToApply = { budget: 0, approval: 0, emissions: 0, techSolar: 0, techWind: 0 };
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

        if (effectsToApply.budget) {
            newResources.budget = {
                 ...newResources.budget, 
                 value: Math.max(0, newResources.budget.value + effectsToApply.budget), // Ensure budget doesn't go negative from policies either
                 available: Math.max(0, newResources.budget.available + effectsToApply.budget) 
            };
        }
        if (effectsToApply.approval) newResources.approval = { ...newResources.approval, value: Math.min(100, Math.max(0, newResources.approval.value + effectsToApply.approval)) };
        if (effectsToApply.emissions) newResources.emissions = { ...newResources.emissions, value: Math.min(100, Math.max(0, newResources.emissions.value + effectsToApply.emissions)) };
        
        // Add other tech/resource effects from policies if any
        // e.g., if (effectsToApply.gridStability) newResources.gridStability = { ... } 

        return {
            ...prev,
            resources: newResources,
            policiesActive: [...new Set([...prev.policiesActive, ...selectedPolicies])] // Use Set to avoid duplicate policy IDs if re-confirmed
        };
    });

    showNotification(`Policies confirmed: ${policyNames.join(', ') || 'None'}. Effects applied.`, 'success');
    setActiveTab('summary');
  };
  
  const endTurn = () => {
    if (gameState.currentTurn < gameState.maxTurns) {
      setGameState(prev => {
        let newApproval = prev.resources.approval.value;
        newApproval = Math.max(0, newApproval - 2);
        
        const nextTurn = prev.currentTurn + 1;
        const baseBudgetIncrease = 50; // Example: Base budget increase per turn

        return {
          ...prev,
          currentTurn: nextTurn,
          currentYear: `${2025 + (nextTurn-1) * 5}-${2030 + (nextTurn-1) * 5}`,
          resources: {
              ...prev.resources,
              budget: { 
                  ...prev.resources.budget, 
                  value: prev.resources.budget.value + baseBudgetIncrease, 
                  available: prev.resources.budget.value + baseBudgetIncrease // Available budget resets/updates based on new total value
                },
              approval: { ...prev.resources.approval, value: newApproval },
          },
          investmentsMade: {}, // Reset for the new turn
          policiesActive: [], // Reset for the new turn (or decide if they persist)
        };
      });
      setSelectedPolicies([]);
      setActiveTab('investments');
      // The notification for starting a new turn is now implicitly handled by the change in gameState.currentTurn
      // which triggers the useEffect to update options. If a specific "New Turn X started" message is desired,
      // it can be added here, or tied to the options loading effect.
      // For example, after setGameState, directly call:
      // showNotification(`Turn ${gameState.currentTurn + 1} has begun!`, 'info'); 
      // Note: gameState.currentTurn won't be updated yet in this exact line, so use the calculated nextTurn or get it from callback of setGameState.
    } else {
      showNotification('Final Turn Completed! View your results.', 'info');
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
    summary: <TurnSummary gameState={gameState} onEndTurn={endTurn} />,
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
      
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="tab-content" id="game-tabs-content">
        {tabContents[activeTab]}
      </div>
    </div>
  );
}

export default GameScreen;
