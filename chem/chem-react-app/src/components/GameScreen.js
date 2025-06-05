import React, { useState, useEffect } from 'react';
import ProgressTrack from './ProgressTrack';
import ResourceDisplay from './ResourceDisplay';
import Tabs from './Tabs';
import InvestmentOptions from './InvestmentOptions';
import PolicyOptions from './PolicyOptions';
import TurnSummary from './TurnSummary';
import RandomEvent from './RandomEvent';
import RegionSelector from './RegionSelector';
import ResearchTree from './ResearchTree';
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
  researchProgress: {
    advancedNuclear: { level: 0, unlocked: false, description: "Advanced reactor designs with improved safety and efficiency" },
    smallModularReactors: { level: 0, unlocked: false, description: "Smaller, scalable nuclear reactors" },
    nextGenSolar: { level: 0, unlocked: false, description: "High-efficiency solar panels" },
    offshoreWind: { level: 0, unlocked: false, description: "Deep water wind installations" },
    smartGrid: { level: 0, unlocked: false, description: "AI-powered grid management" },
    fusionResearch: { level: 0, unlocked: false, description: "Experimental fusion power generation" }
  },
  regions: [
    { 
      id: "northeast", 
      name: "Northeast", 
      isActive: true, 
      energyDemand: 85,
      solarViability: 40,
      windViability: 60,
      nuclearSuitability: 85,
      description: "Dense population with high energy demands and limited space for renewables."
    },
    { 
      id: "midwest", 
      name: "Midwest", 
      isActive: false, 
      energyDemand: 70,
      solarViability: 55,
      windViability: 80,
      nuclearSuitability: 75,
      description: "Significant industrial needs with good wind potential."
    },
    { 
      id: "south", 
      name: "South", 
      isActive: false, 
      energyDemand: 90,
      solarViability: 80,
      windViability: 45,
      nuclearSuitability: 65,
      description: "High cooling needs with excellent solar potential."
    },
    { 
      id: "west", 
      name: "West", 
      isActive: false, 
      energyDemand: 75,
      solarViability: 85,
      windViability: 65,
      nuclearSuitability: 60,
      description: "Diverse geography with strong renewable potential but water scarcity issues."
    }
  ],
  currentRegion: "northeast",
  oppositionGroups: {
    fossilLobby: { influence: 50, stance: -80, name: "Fossil Fuel Lobby" },
    environmentalists: { influence: 60, stance: -30, name: "Environmental Groups" },
    nuclearAdvocates: { influence: 30, stance: 70, name: "Nuclear Advocates" },
    renewableIndustry: { influence: 40, stance: -40, name: "Renewable Industry" }
  },
  currentEvent: null,
  eventHistory: [],
  nuclearProjects: [],
  investmentsMade: {},
  policiesActive: [],
  globalTemperature: 1.2, // Degrees C above pre-industrial levels
  educationalPointsShown: []
};

// Global climate targets
const climateTargets = [
  { year: 2030, emissions: 55, reward: "International Recognition", penalty: "Global Criticism" },
  { year: 2040, emissions: 30, reward: "Climate Leadership Status", penalty: "Trade Sanctions" },
  { year: 2050, emissions: 10, reward: "Sustainable Economy Leader", penalty: "Economic Isolation" }
];

// Opposition group stances (-100 to 100)
// -100: Strongly opposed, 0: Neutral, 100: Strongly supportive
const oppositionImpacts = {
  fossilLobby: { 
    approval: -0.2, 
    budget: 0.1, 
    nuclearStance: -0.1, 
    renewableStance: -0.3
  },
  environmentalists: {
    approval: 0.3,
    emissions: -0.1,
    nuclearStance: -0.2,
    renewableStance: 0.3
  },
  nuclearAdvocates: {
    approval: 0.1,
    nuclearStance: 0.4,
    renewableStance: -0.1
  },
  renewableIndustry: {
    approval: 0.1,
    budget: -0.05,
    nuclearStance: -0.2,
    renewableStance: 0.4
  }
};

// Random events that can occur during the game
const randomEvents = [
  {
    id: "nuclear_innovation",
    title: "Reactor Safety Innovation",
    description: "A breakthrough in passive safety systems makes nuclear plants even safer.",
    effects: {
      approval: 5,
      nuclearStance: 10,
      researchBoost: { target: "advancedNuclear", amount: 2 }
    },
    educationalContent: "Modern nuclear designs incorporate passive safety systems that don't require operator intervention or external power, making meltdowns physically impossible."
  },
  {
    id: "renewable_breakthrough",
    title: "Solar Efficiency Breakthrough",
    description: "New solar panel technology achieves record efficiency in lab tests.",
    effects: {
      renewableStance: 15,
      researchBoost: { target: "nextGenSolar", amount: 2 }
    },
    educationalContent: "While lab breakthroughs are impressive, commercial-scale manufacturing typically takes 5-10 years to match laboratory efficiency levels."
  },
  {
    id: "grid_failure",
    title: "Regional Grid Failure",
    description: "A neighboring region experienced a major blackout due to renewable intermittency.",
    effects: {
      approval: -5,
      gridStability: -5,
      reliability: -8,
      nuclearStance: 5
    },
    educationalContent: "Grid stability requires careful planning when integrating large amounts of variable renewable energy. Baseload power like nuclear helps prevent such failures."
  },
  {
    id: "foreign_nuclear_incident",
    title: "Minor Nuclear Incident Abroad",
    description: "A minor cooling system issue at a foreign nuclear plant caused no injuries but generated headlines.",
    effects: {
      approval: -3,
      nuclearStance: -15
    },
    educationalContent: "Modern Western nuclear plants have multiple redundant safety systems, making them fundamentally different from older designs in many other countries."
  },
  {
    id: "climate_disaster",
    title: "Climate-Linked Weather Disaster",
    description: "A devastating hurricane has caused billions in damage, highlighting climate change impacts.",
    effects: {
      approval: -5,
      economicHealth: -10,
      emissions: 5, // Temporary increase from recovery operations
      renewableStance: 10,
      nuclearStance: 5
    },
    educationalContent: "Zero-emission energy sources like nuclear and renewables are essential for preventing worsening climate impacts."
  },
  {
    id: "international_agreement",
    title: "New International Climate Agreement",
    description: "Nations agree to stricter emissions targets with financial penalties for non-compliance.",
    effects: {
      emissions: -5,
      economicHealth: -3
    },
    educationalContent: "International climate agreements increasingly recognize nuclear energy as a key zero-carbon technology."
  },
  {
    id: "public_opinion_shift",
    title: "Documentary Changes Public Opinion",
    description: "A popular streaming documentary on nuclear energy changes public perception.",
    effects: {
      approval: 3,
      nuclearStance: 20
    },
    educationalContent: "Public perception of nuclear energy is often based on outdated information. Modern nuclear plants have excellent safety records."
  },
  {
    id: "supply_chain_issues",
    title: "Energy Supply Chain Disruption",
    description: "Global supply chain issues affect energy infrastructure construction.",
    effects: {
      budget: -10,
      economicHealth: -5
    },
    multipliers: {
      solar: 1.5, // Solar more affected due to reliance on global supply chains
      wind: 1.3,
      nuclear: 0.8 // Nuclear less affected due to more domestic supply chains
    },
    educationalContent: "Different energy technologies have different supply chain vulnerabilities. Nuclear fuel is energy-dense, requiring smaller physical supply chains."
  }
];

// Multi-turn nuclear projects
const nuclearProjectTemplates = [
  {
    id: "small_modular_reactor",
    name: "Small Modular Reactor",
    description: "Smaller, factory-built nuclear reactors that can be deployed more quickly.",
    duration: 3, // turns to complete
    cost: [15, 20, 25], // cost per turn
    progress: 0,
    requires: { smallModularReactors: 1 },
    effects: {
      onProgress: { // effects applied during construction
        gridStability: 1, 
        approval: 1,
        emissions: -1
      },
      onComplete: { // effects applied on completion
        gridStability: 10,
        reliability: 15,
        emissions: -12,
        approval: 8,
        nuclearStance: 15
      }
    }
  },
  {
    id: "advanced_reactor",
    name: "Advanced Generation IV Reactor",
    description: "Next-generation nuclear technology with enhanced safety and efficiency.",
    duration: 4,
    cost: [20, 25, 30, 35],
    progress: 0,
    requires: { advancedNuclear: 2 },
    effects: {
      onProgress: {
        gridStability: 1,
        approval: 0,
        emissions: 0
      },
      onComplete: {
        gridStability: 15,
        reliability: 20,
        emissions: -20,
        approval: 10,
        nuclearStance: 20
      }
    }
  },
  {
    id: "nuclear_expansion",
    name: "Existing Plant Uprate",
    description: "Upgrade existing nuclear plants to produce more power.",
    duration: 2,
    cost: [15, 15],
    progress: 0,
    requires: { nuclear: 5 },
    effects: {
      onProgress: {
        gridStability: 2,
        emissions: -2
      },
      onComplete: {
        gridStability: 8,
        reliability: 10,
        emissions: -8,
        approval: 5
      }
    }
  }
];

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
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);

  // Effect for updating options based on the current turn
  useEffect(() => {
    updateInvestmentOptions(gameState.currentTurn);
    updatePolicyOptions();
    
    // Generate random event at the start of each turn (except first)
    if (gameState.currentTurn > 1) {
      generateRandomEvent();
    }
    
    // Check for game over conditions
    checkGameOverConditions();
    
    // Update nuclear projects
    progressNuclearProjects();
    
    // Check climate targets
    checkClimateTargets();
    
  }, [gameState.currentTurn]);

  const updateInvestmentOptions = (turn) => {
    // Get base investments for current turn
    let options = [];
    switch(turn) {
      case 1:
        options = investments.turn1;
        break;
      case 2:
        options = investments.turn2;
        break;
      case 3:
        options = investments.turn3;
        break;
      case 4:
        options = investments.turn4;
        break;
      case 5:
        options = investments.turn5;
        break;
      default:
        options = [];
    }
    
    // Filter and modify options based on current region
    const currentRegion = gameState.regions.find(r => r.id === gameState.currentRegion);
    if (currentRegion) {
      // Modify costs and effects based on regional characteristics
      options = options.map(option => {
        const modifiedOption = { ...option };
        
        // Adjust effects based on regional viability
        if (option.id.includes('solar')) {
          // Solar is affected by solar viability
          const solarMultiplier = currentRegion.solarViability / 60; // normalize around 60%
          modifiedOption.effects = units => {
            const baseEffects = option.effects(units);
            return {
              ...baseEffects,
              techSolar: baseEffects.techSolar * solarMultiplier,
              emissions: baseEffects.emissions * solarMultiplier
            };
          };
        } else if (option.id.includes('wind')) {
          // Wind is affected by wind viability
          const windMultiplier = currentRegion.windViability / 60;
          modifiedOption.effects = units => {
            const baseEffects = option.effects(units);
            return {
              ...baseEffects,
              techWind: baseEffects.techWind * windMultiplier,
              emissions: baseEffects.emissions * windMultiplier
            };
          };
        } else if (option.id.includes('nuclear')) {
          // Nuclear is affected by nuclear suitability
          const nuclearMultiplier = currentRegion.nuclearSuitability / 70;
          modifiedOption.effects = units => {
            const baseEffects = option.effects(units);
            return {
              ...baseEffects,
              techNuclear: baseEffects.techNuclear * nuclearMultiplier,
              gridStability: (baseEffects.gridStability || 0) * nuclearMultiplier
            };
          };
        }
        
        // Add region-specific description
        modifiedOption.regionalNote = getRegionalNote(option.id, currentRegion);
        
        return modifiedOption;
      });
      
      // Add region-specific projects if they exist
      // For example, nuclear projects if appropriate
      if (currentRegion.nuclearSuitability > 70 && gameState.techLevels.nuclear >= 5) {
        const availableProjects = nuclearProjectTemplates.filter(project => {
          // Check if project requirements are met
          return Object.entries(project.requires).every(([key, value]) => {
            if (key in gameState.techLevels) {
              return gameState.techLevels[key] >= value;
            }
            if (key in gameState.researchProgress) {
              return gameState.researchProgress[key].level >= value && 
                     gameState.researchProgress[key].unlocked;
            }
            return false;
          });
        });
        
        // Add special project invest option that will trigger the project system
        if (availableProjects.length > 0) {
          availableProjects.forEach(project => {
            options.push({
              id: `start_${project.id}`,
              name: `Start ${project.name}`,
              description: project.description,
              cost: project.cost[0],
              isNuclearProject: true,
              projectId: project.id,
              effects: () => ({}) // Placeholder, actual effects are handled by project system
            });
          });
        }
      }
    }
    
    setCurrentInvestmentOptions(options);
  };
  
  const getRegionalNote = (optionId, region) => {
    if (optionId.includes('solar')) {
      if (region.solarViability > 75) {
        return `This region has excellent solar potential (${region.solarViability}% viability).`;
      } else if (region.solarViability < 45) {
        return `This region has poor solar potential (${region.solarViability}% viability).`;
      }
    } else if (optionId.includes('wind')) {
      if (region.windViability > 75) {
        return `This region has excellent wind potential (${region.windViability}% viability).`;
      } else if (region.windViability < 45) {
        return `This region has poor wind potential (${region.windViability}% viability).`;
      }
    } else if (optionId.includes('nuclear')) {
      if (region.nuclearSuitability > 75) {
        return `This region is highly suitable for nuclear (${region.nuclearSuitability}% suitability).`;
      } else if (region.nuclearSuitability < 45) {
        return `This region has challenges for nuclear deployment (${region.nuclearSuitability}% suitability).`;
      }
    }
    return '';
  };

  const updatePolicyOptions = () => {
    // Get 4 random policies for each turn, but ensure a mix of types
    let selected = [];
    
    // Always include at least one nuclear-related policy if it exists
    const nuclearPolicies = policies.filter(p => 
      p.name.toLowerCase().includes('nuclear') || 
      (p.effects && p.effects.techNuclear)
    );
    
    // Always include at least one renewable-related policy
    const renewablePolicies = policies.filter(p => 
      p.name.toLowerCase().includes('renewable') || 
      p.name.toLowerCase().includes('solar') || 
      p.name.toLowerCase().includes('wind') ||
      (p.effects && (p.effects.techSolar || p.effects.techWind))
    );
    
    // Get other policies
    const otherPolicies = policies.filter(p => 
      !nuclearPolicies.includes(p) && !renewablePolicies.includes(p)
    );
    
    // Add one random nuclear policy if available
    if (nuclearPolicies.length > 0) {
      const randomNuclear = nuclearPolicies[Math.floor(Math.random() * nuclearPolicies.length)];
      selected.push(randomNuclear);
    }
    
    // Add one random renewable policy if available
    if (renewablePolicies.length > 0) {
      const randomRenewable = renewablePolicies[Math.floor(Math.random() * renewablePolicies.length)];
      selected.push(randomRenewable);
    }
    
    // Fill the rest with random policies from others
    while (selected.length < 4 && otherPolicies.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherPolicies.length);
      selected.push(otherPolicies[randomIndex]);
      otherPolicies.splice(randomIndex, 1);
    }
    
    // If we still need more, just add random policies from the full list
    const remainingPolicies = policies.filter(p => !selected.includes(p));
    while (selected.length < 4 && remainingPolicies.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingPolicies.length);
      selected.push(remainingPolicies[randomIndex]);
      remainingPolicies.splice(randomIndex, 1);
    }
    
    // Modify policy effects based on opposition groups' stance
    selected = selected.map(policy => {
      const modifiedPolicy = { ...policy };
      
      // Calculate average stance on policy
      let relevantStance = 0;
      let groupCount = 0;
      
      Object.entries(gameState.oppositionGroups).forEach(([group, data]) => {
        // Determine if this group cares about this policy
        if (
          (policy.name.toLowerCase().includes('nuclear') && group === 'nuclearAdvocates') ||
          (policy.name.toLowerCase().includes('nuclear') && group === 'fossilLobby') ||
          (policy.name.toLowerCase().includes('renewable') && group === 'renewableIndustry') ||
          (policy.name.toLowerCase().includes('renewable') && group === 'environmentalists')
        ) {
          relevantStance += data.stance;
          groupCount++;
        }
      });
      
      if (groupCount > 0) {
        const averageStance = relevantStance / groupCount;
        
        // Adjust approval effect based on stance
        if (policy.effects && policy.effects.approval) {
          const stanceMultiplier = (100 + averageStance) / 100; // ranges from 0 to 2
          modifiedPolicy.effects = {
            ...policy.effects,
            approval: Math.round(policy.effects.approval * stanceMultiplier)
          };
          
          // Add a note about opposition influence
          if (stanceMultiplier > 1.3) {
            modifiedPolicy.oppositionNote = "Strongly supported by influential groups.";
          } else if (stanceMultiplier < 0.7) {
            modifiedPolicy.oppositionNote = "Heavily opposed by powerful groups.";
          }
        }
      }
      
      return modifiedPolicy;
    });
    
    setCurrentPolicyOptions(selected);
  };

  const checkGameOverConditions = () => {
    // Extended game over conditions
    let gameOver = false;
    let gameOverReason = '';
    
    // Check approval
    if (gameState.resources.approval.value < 40) {
      gameOver = true;
      gameOverReason = 'You have been fired due to extremely low public approval!';
    } 
    // Check grid stability
    else if (gameState.resources.gridStability.value < 20) {
      gameOver = true;
      gameOverReason = 'You have been fired due to catastrophic grid collapse!';
    }
    
    if (gameOver) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverReason: gameOverReason
      }));
      showNotification(`Game Over: ${gameOverReason}`, 'danger');
    }
  };

  const handleInvestment = (investmentId, allocatedUnits) => {
    const investment = currentInvestmentOptions.find(inv => inv.id === investmentId);
    if (!investment) return;

    // Check if this is a nuclear project start
    if (investment.isNuclearProject && investment.projectId) {
      startNuclearProject(investment.projectId);
      return;
    }

    const totalCost = investment.cost * allocatedUnits;
    if (totalCost > gameState.resources.budget.available) {
      showNotification('Not enough budget for this allocation!', 'danger');
      return;
    }

    const effects = investment.effects(allocatedUnits);
    
    setGameState(prev => {
      const newResources = { ...prev.resources };
      const newTechLevels = { ...prev.techLevels };
      const newResearchProgress = { ...prev.researchProgress };
      
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
      
      if (effects.reliability) {
        newResources.reliability = { 
          ...newResources.reliability, 
          value: Math.min(100, Math.max(0, newResources.reliability.value + effects.reliability))
        };
      }
      
      if (effects.economicHealth) {
        newResources.economicHealth = { 
          ...newResources.economicHealth, 
          value: Math.min(100, Math.max(0, newResources.economicHealth.value + effects.economicHealth))
        };
      }
      
      // Apply tech level effects
      if (effects.techNuclear) newTechLevels.nuclear += effects.techNuclear;
      if (effects.techSolar) newTechLevels.solar += effects.techSolar;
      if (effects.techWind) newTechLevels.wind += effects.techWind;
      if (effects.techGrid) newTechLevels.grid += effects.techGrid;
      if (effects.techStorage) newTechLevels.storage += effects.techStorage;
      
      // Apply research progress effects
      Object.keys(newResearchProgress).forEach(key => {
        if (effects[`research${key.charAt(0).toUpperCase() + key.slice(1)}`]) {
          const progress = newResearchProgress[key];
          const increase = effects[`research${key.charAt(0).toUpperCase() + key.slice(1)}`];
          
          progress.level += increase;
          
          // Check if research unlocked
          if (progress.level >= 3 && !progress.unlocked) {
            progress.unlocked = true;
            showNotification(`Research breakthrough: ${key} has been unlocked!`, 'success');
          }
        }
      });

      // Update opposition groups based on investments
      const newOppositionGroups = { ...prev.oppositionGroups };
      
      // Investments that affect opposition groups
      if (investment.id.includes('nuclear')) {
        // Nuclear investments affect different groups differently
        newOppositionGroups.nuclearAdvocates.stance = Math.min(100, newOppositionGroups.nuclearAdvocates.stance + 2 * allocatedUnits);
        newOppositionGroups.fossilLobby.stance = Math.max(-100, newOppositionGroups.fossilLobby.stance - 1 * allocatedUnits);
        newOppositionGroups.environmentalists.stance = Math.max(-100, newOppositionGroups.environmentalists.stance - 0.5 * allocatedUnits);
      } else if (investment.id.includes('solar') || investment.id.includes('wind')) {
        // Renewable investments
        newOppositionGroups.renewableIndustry.stance = Math.min(100, newOppositionGroups.renewableIndustry.stance + 2 * allocatedUnits);
        newOppositionGroups.environmentalists.stance = Math.min(100, newOppositionGroups.environmentalists.stance + 1 * allocatedUnits);
        newOppositionGroups.fossilLobby.stance = Math.max(-100, newOppositionGroups.fossilLobby.stance - 1 * allocatedUnits);
      }

      return {
        ...prev,
        resources: newResources,
        techLevels: newTechLevels,
        researchProgress: newResearchProgress,
        oppositionGroups: newOppositionGroups,
        investmentsMade: {
          ...prev.investmentsMade,
          [investmentId]: (prev.investmentsMade[investmentId] || 0) + allocatedUnits
        }
      };
    });

    // Show educational content for first-time investments
    if (!gameState.educationalPointsShown.includes(investmentId) && investment.educationalContent) {
      showEducationalPoint(investment.educationalContent, investment.name);
      setGameState(prev => ({
        ...prev,
        educationalPointsShown: [...prev.educationalPointsShown, investmentId]
      }));
    }

    showNotification(`${Math.round(allocatedUnits)} unit(s) of ${investment.name} funded. Cost: $${Math.round(totalCost)}B`, 'success');
  };
  
  const showEducationalPoint = (content, title) => {
    // This would be implemented with a modal or tooltip system
    showNotification(`Energy Fact: ${content}`, 'info', 10000); // longer duration
  };
  
    const calculateTurnEffects = () => {    
    // Calculate effects from tech levels and other factors    
    let stabilityChange = -8; // Base rate of decline    
    let emissionsChange = 0;    
    let approvalChange = -5; // Base rate of decline    
    
    // Current region affects baseline changes    
    const currentRegion = gameState.regions.find(r => r.id === gameState.currentRegion);    
    if (currentRegion) {      
      // Higher energy demand regions have more challenges      
      if (currentRegion.energyDemand > 80) {        
        stabilityChange -= 2;      
      } else if (currentRegion.energyDemand < 60) {        
        stabilityChange += 1;      
      }    
    }    
    
    // Nuclear effects increase over time    
    if (gameState.techLevels.nuclear >= 25) {      
      stabilityChange += 8;      
      emissionsChange -= 15;      
      approvalChange += 5;    
    } else if (gameState.techLevels.nuclear >= 15) {      
      stabilityChange += 5;      
      emissionsChange -= 10;      
      approvalChange += 3;    
    } else if (gameState.techLevels.nuclear >= 5) {      
      stabilityChange += 2;      
      emissionsChange -= 4;      
      approvalChange += 1;    
    }    
    
    // Solar and wind provide some benefits but less than nuclear    
    const renewableLevel = gameState.techLevels.solar + gameState.techLevels.wind;    
    if (renewableLevel >= 40) {      
      emissionsChange -= 12;      
      approvalChange += 3;      
      // But high renewable without storage hurts stability      
      if (gameState.techLevels.storage < 15) {        
        stabilityChange -= 8;      
      } else if (gameState.techLevels.storage < 10) {        
        stabilityChange -= 5;      
      }    
    } else if (renewableLevel >= 20) {      
      emissionsChange -= 6;      
      approvalChange += 2;      
      if (gameState.techLevels.storage < 8) {        
        stabilityChange -= 4;      
      } else if (gameState.techLevels.storage < 4) {        
        stabilityChange -= 2;      
      }    
    }    
    
    // Grid improvements help stability    
    if (gameState.techLevels.grid >= 15) {      
      stabilityChange += 6;    
    } else if (gameState.techLevels.grid >= 8) {      
      stabilityChange += 3;    
    } else if (gameState.techLevels.grid >= 3) {      
      stabilityChange += 1;    
    }    
    
    // Storage helps with stability    
    if (gameState.techLevels.storage >= 15) {      
      stabilityChange += 5;    
    } else if (gameState.techLevels.storage >= 8) {      
      stabilityChange += 3;    
    } else if (gameState.techLevels.storage >= 3) {      
      stabilityChange += 1;    
    }    
    
    // Opposition groups influence approval    
    Object.entries(gameState.oppositionGroups).forEach(([group, data]) => {      
      const impact = oppositionImpacts[group];      
      if (impact && typeof impact.approval === 'number') { // Check if impact and impact.approval exist        
        // Scale impact based on influence and stance        
        const scaleFactor = (data.influence / 100) * (data.stance / 100);        
        approvalChange += impact.approval * scaleFactor * 10;      
      }    
    });    
    
    // Climate temperature affects approval    
    if (gameState.globalTemperature > 2.0) {      
      approvalChange -= 3;    
    } else if (gameState.globalTemperature > 1.5) {      
      approvalChange -= 1;    
    }    
    
    // Return all calculated changes    
    return {       
      stabilityChange,       
      emissionsChange,       
      approvalChange,       
      temperatureChange: calculateTemperatureChange(gameState.resources.emissions.value)    
    };
  };
  
  const calculateTemperatureChange = (emissionsLevel) => {
    // Simple model: higher emissions = faster temperature rise
    const baseIncrease = 0.1; // 0.1°C per turn
    
    if (emissionsLevel > 90) {
      return baseIncrease * 1.5;
    } else if (emissionsLevel > 70) {
      return baseIncrease * 1.2;
    } else if (emissionsLevel > 50) {
      return baseIncrease * 0.8;
    } else if (emissionsLevel > 30) {
      return baseIncrease * 0.5;
    } else {
      return baseIncrease * 0.2;
    }
  };
  
  const calculateScore = () => {
    // Calculate score based on emissions reduction, stability and approval
    const emissionsScore = 100 - gameState.resources.emissions.value; // Lower emissions = higher score
    const stabilityScore = gameState.resources.gridStability.value;
    const approvalScore = gameState.resources.approval.value;
    
    // Nuclear focus bonus
    const nuclearBonus = gameState.techLevels.nuclear * 3;
    
    // Research bonus
    let researchBonus = 0;
    Object.values(gameState.researchProgress).forEach(research => {
      if (research.unlocked) {
        researchBonus += 50;
      }
    });
    
    // Temperature penalty
    const temperaturePenalty = Math.max(0, (gameState.globalTemperature - 1.0) * 100);
    
    // Calculate final score
    const totalScore = emissionsScore * 3 + 
                       stabilityScore * 2 + 
                       approvalScore + 
                       nuclearBonus + 
                       researchBonus - 
                       temperaturePenalty;
    
    return Math.round(totalScore);
  };
  
    const endTurn = () => {
      if (gameState.currentTurn < gameState.maxTurns && !gameState.gameOver) {
        const { 
          stabilityChange, 
          emissionsChange, 
          approvalChange, 
          temperatureChange 
        } = calculateTurnEffects();
        
        setGameState(prev => {
          const nextTurn = prev.currentTurn + 1;
          const baseBudgetIncrease = 50;
          
          // Update resources with turn effects
          const newApproval = Math.min(100, Math.max(0, prev.resources.approval.value + approvalChange));
          const newStability = Math.min(100, Math.max(0, prev.resources.gridStability.value + stabilityChange));
          const newEmissions = Math.min(100, Math.max(0, prev.resources.emissions.value + emissionsChange));
          
          // Calculate score
          const turnScore = calculateScore();
          
          // Calculate global temperature change
          const newTemperature = Math.max(1.0, prev.globalTemperature + temperatureChange);

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
            globalTemperature: newTemperature,
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
          gameOverReason: 'You have completed your energy policy plan!'
        }));
        
        showNotification(`Game Complete! Final Score: ${Math.round(finalScore)}`, 'success');
      }
    };

  // Method to generate random events
  const generateRandomEvent = () => {
    // 70% chance of event occurring each turn
    if (Math.random() < 0.7) {
      const eligibleEvents = randomEvents.filter(event => 
        !gameState.eventHistory.some(pastEvent => 
          pastEvent.id === event.id && gameState.currentTurn - pastEvent.turn < 2
        )
      );
      
      if (eligibleEvents.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleEvents.length);
        const selectedEvent = eligibleEvents[randomIndex];
        
        setGameState(prev => ({
          ...prev,
          currentEvent: {
            ...selectedEvent,
            turn: prev.currentTurn
          },
          eventHistory: [...prev.eventHistory, { 
            id: selectedEvent.id, 
            title: selectedEvent.title,
            turn: prev.currentTurn 
          }]
        }));
        
        setShowEventModal(true);
      }
    }
  };
  
  // Method to handle event effects
  const handleEventEffects = () => {
    if (!gameState.currentEvent) return;
    
    const event = gameState.currentEvent;
    setGameState(prev => {
      // Create new state objects
      const newResources = { ...prev.resources };
      const newOppositionGroups = { ...prev.oppositionGroups };
      const newResearchProgress = { ...prev.researchProgress };
      
      // Apply direct resource effects
      if (event.effects.approval) {
        newResources.approval = {
          ...newResources.approval,
          value: Math.min(100, Math.max(0, newResources.approval.value + event.effects.approval))
        };
      }
      
      if (event.effects.gridStability) {
        newResources.gridStability = {
          ...newResources.gridStability,
          value: Math.min(100, Math.max(0, newResources.gridStability.value + event.effects.gridStability))
        };
      }
      
      if (event.effects.reliability) {
        newResources.reliability = {
          ...newResources.reliability,
          value: Math.min(100, Math.max(0, newResources.reliability.value + event.effects.reliability))
        };
      }
      
      if (event.effects.emissions) {
        newResources.emissions = {
          ...newResources.emissions,
          value: Math.min(100, Math.max(0, newResources.emissions.value + event.effects.emissions))
        };
      }
      
      if (event.effects.economicHealth) {
        newResources.economicHealth = {
          ...newResources.economicHealth,
          value: Math.min(100, Math.max(0, newResources.economicHealth.value + event.effects.economicHealth))
        };
      }
      
      if (event.effects.budget) {
        newResources.budget = {
          ...newResources.budget,
          value: Math.max(0, newResources.budget.value + event.effects.budget),
          available: Math.max(0, newResources.budget.available + event.effects.budget)
        };
      }
      
      // Apply stance changes
      if (event.effects.nuclearStance) {
        Object.keys(newOppositionGroups).forEach(group => {
          const groupData = newOppositionGroups[group];
          // Apply different amounts based on group's existing stance
          const stanceModifier = event.effects.nuclearStance * (groupData.influence / 100);
          groupData.stance = Math.min(100, Math.max(-100, groupData.stance + stanceModifier));
        });
      }
      
      if (event.effects.renewableStance) {
        Object.keys(newOppositionGroups).forEach(group => {
          const groupData = newOppositionGroups[group];
          // Apply different amounts based on group's existing stance
          const stanceModifier = event.effects.renewableStance * (groupData.influence / 100);
          groupData.stance = Math.min(100, Math.max(-100, groupData.stance + stanceModifier));
        });
      }
      
      // Apply research boosts
      if (event.effects.researchBoost) {
        const { target, amount } = event.effects.researchBoost;
        if (newResearchProgress[target]) {
          newResearchProgress[target] = {
            ...newResearchProgress[target],
            level: newResearchProgress[target].level + amount
          };
          
          // Check if this unlocks the research
          if (newResearchProgress[target].level >= 3 && !newResearchProgress[target].unlocked) {
            newResearchProgress[target].unlocked = true;
            showNotification(`Research breakthrough: ${target} has been unlocked!`, 'success');
          }
        }
      }
      
      // Track that we showed the educational content
      const newEducationalPointsShown = [...prev.educationalPointsShown];
      if (event.educationalContent && !newEducationalPointsShown.includes(event.id)) {
        newEducationalPointsShown.push(event.id);
      }
      
      return {
        ...prev,
        resources: newResources,
        oppositionGroups: newOppositionGroups,
        researchProgress: newResearchProgress,
        currentEvent: null,
        educationalPointsShown: newEducationalPointsShown
      };
    });
    
    setShowEventModal(false);
  };
  
  // Method to handle region selection
  const handleRegionChange = (regionId) => {
    // Check if this is a new region
    const isNewRegion = gameState.currentRegion !== regionId;
    
    setGameState(prev => {
      const newRegions = prev.regions.map(region => ({
        ...region,
        isActive: region.id === regionId
      }));
      
      return {
        ...prev,
        currentRegion: regionId,
        regions: newRegions
      };
    });
    
    if (isNewRegion) {
      // Apply effects of changing regions
      showNotification(`Now focusing on the ${regionId.charAt(0).toUpperCase() + regionId.slice(1)} region`, 'info');
      updateInvestmentOptions(gameState.currentTurn);
    }
    
    setShowRegionModal(false);
  };
  
  // Method to start a new nuclear project
  const startNuclearProject = (projectId) => {
    const projectTemplate = nuclearProjectTemplates.find(p => p.id === projectId);
    if (!projectTemplate) return;
    
    // Check requirements
    const requirementsMet = Object.entries(projectTemplate.requires).every(([key, value]) => {
      if (key in gameState.techLevels) {
        return gameState.techLevels[key] >= value;
      }
      if (key in gameState.researchProgress) {
        return gameState.researchProgress[key].level >= value && 
               gameState.researchProgress[key].unlocked;
      }
      return false;
    });
    
    if (!requirementsMet) {
      showNotification("You don't meet the requirements for this project yet", 'warning');
      return;
    }
    
    // Check budget for first payment
    if (projectTemplate.cost[0] > gameState.resources.budget.available) {
      showNotification("Not enough budget to start this project", 'danger');
      return;
    }
    
    // Create the project and add it to state
    const newProject = {
      ...projectTemplate,
      startTurn: gameState.currentTurn,
      currentPhase: 0,
      regionId: gameState.currentRegion
    };
    
    setGameState(prev => {
      // Deduct cost
      const newResources = { ...prev.resources };
      newResources.budget = {
        ...newResources.budget,
        value: Math.max(0, newResources.budget.value - projectTemplate.cost[0]),
        available: Math.max(0, newResources.budget.available - projectTemplate.cost[0])
      };
      
      return {
        ...prev,
        nuclearProjects: [...prev.nuclearProjects, newProject],
        resources: newResources
      };
    });
    
    showNotification(`Started new nuclear project: ${projectTemplate.name}`, 'success');
  };
  
  // Method to progress nuclear projects each turn
  const progressNuclearProjects = () => {
    setGameState(prev => {
      const newProjects = [];
      const completedProjects = [];
      const newResources = { ...prev.resources };
      const newTechLevels = { ...prev.techLevels };
      
      prev.nuclearProjects.forEach(project => {
        // Skip projects that are already complete
        if (project.currentPhase >= project.duration) {
          newProjects.push(project);
          return;
        }
        
        // Determine if we need to pay for the next phase
        if (project.currentPhase < project.duration - 1) {
          const nextPhaseCost = project.cost[project.currentPhase + 1];
          
          // If we can't afford the next phase, project stalls but isn't canceled
          if (nextPhaseCost > prev.resources.budget.available) {
            newProjects.push(project);
            showNotification(`${project.name} stalled due to insufficient funds`, 'warning');
            return;
          }
          
          // Deduct cost
          newResources.budget = {
            ...newResources.budget,
            value: Math.max(0, newResources.budget.value - nextPhaseCost),
            available: Math.max(0, newResources.budget.available - nextPhaseCost)
          };
        }
        
        // Progress the project
        const updatedProject = { ...project, currentPhase: project.currentPhase + 1 };
        
        // Apply ongoing effects during construction
        if (project.effects.onProgress) {
          Object.entries(project.effects.onProgress).forEach(([key, value]) => {
            if (key === 'gridStability') {
              newResources.gridStability = {
                ...newResources.gridStability,
                value: Math.min(100, Math.max(0, newResources.gridStability.value + value))
              };
            } else if (key === 'reliability') {
              newResources.reliability = {
                ...newResources.reliability,
                value: Math.min(100, Math.max(0, newResources.reliability.value + value))
              };
            } else if (key === 'emissions') {
              newResources.emissions = {
                ...newResources.emissions,
                value: Math.min(100, Math.max(0, newResources.emissions.value + value))
              };
            } else if (key === 'approval') {
              newResources.approval = {
                ...newResources.approval,
                value: Math.min(100, Math.max(0, newResources.approval.value + value))
              };
            }
          });
        }
        
        // Check if project is now complete
        if (updatedProject.currentPhase >= updatedProject.duration) {
          completedProjects.push(updatedProject);
          
          // Apply completion effects
          if (project.effects.onComplete) {
            Object.entries(project.effects.onComplete).forEach(([key, value]) => {
              if (key === 'gridStability') {
                newResources.gridStability = {
                  ...newResources.gridStability,
                  value: Math.min(100, Math.max(0, newResources.gridStability.value + value))
                };
              } else if (key === 'reliability') {
                newResources.reliability = {
                  ...newResources.reliability,
                  value: Math.min(100, Math.max(0, newResources.reliability.value + value))
                };
              } else if (key === 'emissions') {
                newResources.emissions = {
                  ...newResources.emissions,
                  value: Math.min(100, Math.max(0, newResources.emissions.value + value))
                };
              } else if (key === 'approval') {
                newResources.approval = {
                  ...newResources.approval,
                  value: Math.min(100, Math.max(0, newResources.approval.value + value))
                };
              } else if (key === 'nuclearStance') {
                // Update opposition group stances
                const newOppositionGroups = { ...prev.oppositionGroups };
                Object.keys(newOppositionGroups).forEach(group => {
                  const groupData = newOppositionGroups[group];
                  const stanceModifier = value * (groupData.influence / 100);
                  groupData.stance = Math.min(100, Math.max(-100, groupData.stance + stanceModifier));
                });
              }
            });
          }
          
          // Increase nuclear tech level
          newTechLevels.nuclear += 5;
        }
        
        newProjects.push(updatedProject);
      });
      
      // Notify about completed projects
      completedProjects.forEach(project => {
        showNotification(`Nuclear project completed: ${project.name}!`, 'success');
      });
      
      return {
        ...prev,
        nuclearProjects: newProjects,
        resources: newResources,
        techLevels: newTechLevels
      };
    });
  };
  
  // Method to check climate targets
  const checkClimateTargets = () => {
    const currentYear = 2025 + (gameState.currentTurn - 1) * 5;
    
    climateTargets.forEach(target => {
      if (currentYear === target.year) {
        const emissionsReduction = 100 - gameState.resources.emissions.value;
        
        if (emissionsReduction >= target.emissions) {
          showNotification(`Climate target met! ${target.reward}`, 'success');
          setGameState(prev => ({
            ...prev,
            resources: {
              ...prev.resources,
              approval: {
                ...prev.resources.approval,
                value: Math.min(100, prev.resources.approval.value + 10)
              },
              economicHealth: {
                ...prev.resources.economicHealth,
                value: Math.min(100, prev.resources.economicHealth.value + 5)
              }
            },
            score: prev.score + 100
          }));
        } else {
          showNotification(`Climate target missed. ${target.penalty}`, 'danger');
          setGameState(prev => ({
            ...prev,
            resources: {
              ...prev.resources,
              approval: {
                ...prev.resources.approval,
                value: Math.max(0, prev.resources.approval.value - 8)
              },
              economicHealth: {
                ...prev.resources.economicHealth,
                value: Math.max(0, prev.resources.economicHealth.value - 10)
              }
            }
          }));
        }
      }
    });
  };

  // Functions for the tab content
  const confirmInvestments = () => {
    showNotification('Investments locked in for the turn.', 'success');
    setActiveTab('policies');
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

  const confirmPolicies = () => {
    // Apply policy effects
    let effectsToApply = { 
      budget: 0, 
      approval: 0, 
      emissions: 0, 
      gridStability: 0,
      reliability: 0,
      economicHealth: 0,
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
        const newOppositionGroups = { ...prev.oppositionGroups };

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
        
        if (effectsToApply.reliability) {
            newResources.reliability = { 
                ...newResources.reliability, 
                value: Math.min(100, Math.max(0, newResources.reliability.value + effectsToApply.reliability)) 
            };
        }
        
        if (effectsToApply.economicHealth) {
            newResources.economicHealth = { 
                ...newResources.economicHealth, 
                value: Math.min(100, Math.max(0, newResources.economicHealth.value + effectsToApply.economicHealth)) 
            };
        }
        
        // Apply tech level effects
        if (effectsToApply.techNuclear) newTechLevels.nuclear += effectsToApply.techNuclear;
        if (effectsToApply.techSolar) newTechLevels.solar += effectsToApply.techSolar;
        if (effectsToApply.techWind) newTechLevels.wind += effectsToApply.techWind;
        if (effectsToApply.techGrid) newTechLevels.grid += effectsToApply.techGrid;
        if (effectsToApply.techStorage) newTechLevels.storage += effectsToApply.techStorage;
        
        // Apply effects to opposition groups if applicable
        if (selectedPolicies.some(id => id.includes('nuclear'))) {
            // Nuclear policies shift nuclear advocate stance
            newOppositionGroups.nuclearAdvocates.stance = Math.min(100, newOppositionGroups.nuclearAdvocates.stance + 5);
            // And might shift other groups negatively
            newOppositionGroups.environmentalists.stance = Math.max(-100, newOppositionGroups.environmentalists.stance - 2);
        }
        
        if (selectedPolicies.some(id => id.includes('renewable'))) {
            // Renewable policies shift renewable industry stance
            newOppositionGroups.renewableIndustry.stance = Math.min(100, newOppositionGroups.renewableIndustry.stance + 5);
            newOppositionGroups.environmentalists.stance = Math.min(100, newOppositionGroups.environmentalists.stance + 3);
            // And might shift fossil lobby negatively
            newOppositionGroups.fossilLobby.stance = Math.max(-100, newOppositionGroups.fossilLobby.stance - 3);
        }

        return {
            ...prev,
            resources: newResources,
            techLevels: newTechLevels,
            oppositionGroups: newOppositionGroups,
            policiesActive: [...selectedPolicies]
        };
    });

    showNotification(`Policies confirmed: ${policyNames.join(', ') || 'None'}. Effects applied.`, 'success');
    setActiveTab('summary');
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
        nuclearProjects={gameState.nuclearProjects}
        globalTemperature={gameState.globalTemperature}
      />
    ),
    research: (
      <ResearchTree
        researchProgress={gameState.researchProgress}
        techLevels={gameState.techLevels}
        onResearchSelect={(researchId) => {
          // This would be implemented to boost research directly
          showNotification("Research system to be implemented", 'info');
          setShowResearchModal(false);
        }}
      />
        ),
  };

  return (
    <div className="screen active" id="game-screen">
      <div className="d-flex justify-content-between align-items-center mt-0 mb-3 px-3 pb-3 rounded">
        <div className="h3 mb-0" id="current-year">{gameState.currentYear}</div>
        <div className="h5 mb-0">Turn <span id="current-turn">{gameState.currentTurn}</span> of {gameState.maxTurns}</div>
        <div className="d-flex">
          <button 
            className="btn btn-sm btn-outline-info" 
            onClick={() => setShowResearchModal(true)}
            disabled={gameState.gameOver}
          >
            <i className="bi bi-lightbulb"></i> Research
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <ProgressTrack currentTurn={gameState.currentTurn} maxTurns={gameState.maxTurns} />
        <div className="climate-indicator">
          <span className="badge bg-danger">
            +{(Math.round(gameState.globalTemperature * 10) / 10).toFixed(1)}°C
          </span>
        </div>
      </div>

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
                  {gameState.resources.approval.value < 40 
                    ? "The public has lost confidence in your leadership. Your energy policies have become too unpopular to continue."
                    : gameState.resources.gridStability.value < 20
                    ? "The power grid has become unstable under your leadership, resulting in widespread blackouts and economic damage."
                    : gameState.resources.reliability && gameState.resources.reliability.value < 25
                    ? "Your energy system has proven unreliable, causing industrial losses and public frustration."
                    : "The economy has suffered severely under your energy policies."}
                </p>
              </div>
            )}
            
            <p>Final Score: {Math.round(gameState.score)}</p>
            <h4>Technology Levels Achieved:</h4>
            <ul>
              <li>Nuclear: {Math.round(gameState.techLevels.nuclear)}</li>
              <li>Solar: {Math.round(gameState.techLevels.solar)}</li>
              <li>Wind: {Math.round(gameState.techLevels.wind)}</li>
              <li>Grid Technology: {Math.round(gameState.techLevels.grid)}</li>
              <li>Storage: {Math.round(gameState.techLevels.storage)}</li>
            </ul>
            
            <h4>Research Breakthroughs:</h4>
            <ul>
              {Object.entries(gameState.researchProgress)
                .filter(([_, research]) => research.unlocked)
                .map(([key, research]) => (
                  <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {research.description}</li>
                ))}
              {Object.values(gameState.researchProgress).every(r => !r.unlocked) && (
                <li>No research breakthroughs achieved</li>
              )}
            </ul>
            
            <h4>Nuclear Projects:</h4>
            <ul>
              {gameState.nuclearProjects
                .filter(project => project.currentPhase >= project.duration)
                .map(project => (
                  <li key={project.id}>{project.name} - Completed in the {project.regionId} region</li>
                ))}
              {gameState.nuclearProjects.filter(p => p.currentPhase >= p.duration).length === 0 && (
                <li>No nuclear projects completed</li>
              )}
            </ul>
            
            <h4>Final Results:</h4>
            <p>Emissions Reduced: {Math.round(100 - gameState.resources.emissions.value)}%</p>
            <p>Grid Stability: {Math.round(gameState.resources.gridStability.value)}%</p>
            <p>Public Approval: {Math.round(gameState.resources.approval.value)}%</p>
            <p>Global Temperature Rise: +{(Math.round(gameState.globalTemperature * 10) / 10).toFixed(1)}°C</p>
            
            {gameState.gameOverReason.includes("fired") ? (
              <div className="mt-4">
                <h4>Post-Mortem Analysis</h4>
                <p>
                  {gameState.techLevels.nuclear < 10 
                    ? "Your failure to adequately develop nuclear energy created an unstable energy mix that couldn't meet the nation's needs."
                    : gameState.techLevels.nuclear >= 20 && gameState.resources.gridStability.value < 30
                    ? "Despite strong nuclear development, you failed to properly manage the grid transition."
                    : gameState.techLevels.nuclear >= 15 && gameState.resources.approval.value < 40
                    ? "Your nuclear-focused strategy was technically sound but politically unsuccessful."
                    : "Your energy policy failed to achieve the right balance of reliability, emissions reduction, and public support."}
                </p>
                <p>Remember: A stable energy future requires solid planning and strategic investment in reliable baseload power.</p>
              </div>
            ) : (
              <div className="mt-4">
                <h4>Energy Policy Analysis</h4>
                <p>
                  {gameState.techLevels.nuclear >= 25 && gameState.resources.gridStability.value >= 80
                    ? "Your strong focus on nuclear power created a stable, clean, and reliable energy system. Future generations will benefit from your foresight."
                    : gameState.techLevels.nuclear >= 15 && gameState.resources.emissions.value <= 30
                    ? "Your balanced approach successfully reduced emissions while maintaining grid reliability."
                    : gameState.resources.emissions.value <= 20
                    ? "You achieved impressive emissions reductions, but potentially at the cost of long-term stability."
                    : "Your cautious approach yielded mixed results. More ambitious action might have created a cleaner, more stable grid."}
                </p>
              </div>
            )}
          </div>
        ) : (
          tabContents[activeTab]
        )}
      </div>
      
      {/* Random Event Modal */}
      {showEventModal && gameState.currentEvent && (
        <div className="modal show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{gameState.currentEvent.title}</h5>
              </div>
              <div className="modal-body">
                <p>{gameState.currentEvent.description}</p>
                
                <div className="event-effects">
                  <h6>Effects:</h6>
                  <ul>
                    {Object.entries(gameState.currentEvent.effects).map(([key, value]) => {
                      if (key === 'researchBoost' || key === 'multipliers') return null;
                      return (
                        <li key={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value > 0 ? '+' + value : value}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {gameState.currentEvent.educationalContent && (
                  <div className="alert alert-info mt-3">
                    <i className="bi bi-info-circle me-2"></i>
                    {gameState.currentEvent.educationalContent}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleEventEffects}>
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      
      
      {/* Research Modal */}
      {showResearchModal && (
        <div className="modal show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Research & Development</h5>
                <button type="button" className="btn-close" style={{backgroundColor: '#dc3545'}} onClick={() => setShowResearchModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {Object.entries(gameState.researchProgress).map(([key, research]) => (
                    <div className="col-md-6 mb-3" key={key}>
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</h5>
                          <p className="card-text">{research.description}</p>
                          <div className="progress mb-2">
                            <div 
                              className={`progress-bar ${research.unlocked ? 'bg-success' : 'bg-info'}`} 
                              role="progressbar" 
                              style={{width: `${Math.min(100, (research.level / 3) * 100)}%`}}
                              aria-valuenow={research.level} 
                              aria-valuemin="0" 
                              aria-valuemax="3">
                              Level {research.level}/3
                            </div>
                          </div>
                          <div className="text-center">
                            {research.unlocked ? (
                              <span className="badge bg-success">Unlocked</span>
                            ) : (
                              <span className="badge bg-secondary">In Progress</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameScreen;
