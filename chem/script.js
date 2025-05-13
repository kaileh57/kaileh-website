// Game Data and State
const gameData = {
    countries: [
        {
            id: "usa",
            name: "United States",
            theme: "usa-theme",
            startingBudget: 120,
            startingApproval: 50,
            startingGrid: 75,
            startingEmissions: 100,
            techLevels: { solar: 60, wind: 65, storage: 70, nuclear: 60, grid: 70 },
            strengths: [
                "Technology Leadership: +20% research effectiveness",
                "Private Capital Access: 1.5x budget multiplier on selected projects",
                "Innovation Ecosystem: 10% chance of bonus tech breakthrough each turn",
                "Energy Diversity: No single technology limit"
            ],
            challenges: [
                "Political Division: Policy changes cost +25% public approval",
                "Regulatory Complexity: Infrastructure projects take longer",
                "High Consumption: Efficiency measures 25% less effective",
                "Existing Infrastructure: Higher cost to retire fossil assets"
            ],
            specialVictory: "Technological Dominance: Achieve highest tech level in at least 3 categories",
            description: "A global superpower with tremendous resources, technological capabilities, and existing infrastructure, but facing political gridlock and high energy consumption patterns."
        },
        {
            id: "china",
            name: "China",
            theme: "china-theme",
            startingBudget: 150,
            startingApproval: 70,
            startingGrid: 65,
            startingEmissions: 100,
            techLevels: { solar: 75, wind: 60, storage: 60, nuclear: 50, grid: 55 },
            strengths: [
                "Manufacturing Powerhouse: -30% cost for technology deployment at scale",
                "Centralized Planning: Implement policies with lower public approval cost",
                "Infrastructure Efficiency: +30% speed in grid upgrades",
                "Resource Mobilization: Can exceed budget by 20% for critical projects"
            ],
            challenges: [
                "Coal Dependence: Starting energy mix heavily coal-dominated",
                "Environmental Degradation: Environmental crises more likely",
                "Regional Development Gaps: Uneven implementation effectiveness",
                "Water Scarcity: Cooling water limitations for certain technologies"
            ],
            specialVictory: "Clean Manufacturing Dominance: Become global leader in 3+ clean technology exports",
            description: "The world's largest energy consumer and carbon emitter, with strong manufacturing capabilities, centralized planning power, but significant coal dependence and environmental challenges."
        },
        {
            id: "india",
            name: "India",
            theme: "india-theme",
            startingBudget: 40,
            startingApproval: 60,
            startingGrid: 55,
            startingEmissions: 100,
            techLevels: { solar: 55, wind: 40, storage: 30, nuclear: 35, grid: 40 },
            strengths: [
                "Solar Resource Potential: +30% effectiveness for solar investments",
                "IT Sector Capability: +20% effectiveness in smart grid and digital systems",
                "Demographic Dividend: Lower labor costs for infrastructure",
                "Frugal Innovation: 20% cost reduction for adapted technologies"
            ],
            challenges: [
                "Development Priorities: Must balance energy access with climate goals",
                "Capital Constraints: Higher financing costs for large projects",
                "Implementation Gaps: 20% effectiveness penalty on complex projects",
                "Coal Dependence: Strong domestic coal lobby and existing assets"
            ],
            specialVictory: "Leapfrog Development: Achieve energy access for all while meeting climate goals",
            description: "A rapidly developing nation with enormous renewable potential and IT capabilities, but facing the challenge of lifting millions out of poverty while reducing emissions."
        },
        {
            id: "germany",
            name: "Germany",
            theme: "germany-theme",
            startingBudget: 80,
            startingApproval: 65,
            startingGrid: 70,
            startingEmissions: 100,
            techLevels: { solar: 60, wind: 75, storage: 60, nuclear: 30, grid: 65 },
            strengths: [
                "Engineering Excellence: +20% effectiveness in all infrastructure projects",
                "Strong Public Climate Commitment: +10% Public Approval for climate actions",
                "EU Integration: Access to regional grid balancing",
                "Industrial Efficiency: +15% effectiveness in industrial transformations"
            ],
            challenges: [
                "High Energy Costs: Public sensitivity to additional cost increases",
                "Nuclear Phaseout: Must replace nuclear capacity with clean alternatives",
                "Limited Domestic Resources: Constrained by geography and population density",
                "Industry Transition Challenges: Heavy manufacturing sector to decarbonize"
            ],
            specialVictory: "Energy Independence: Eliminate fossil fuel imports while maintaining industrial strength",
            description: "A technological leader with strong public support for climate action, but facing the challenge of maintaining industrial competitiveness while phasing out nuclear and fossil fuels."
        },
        {
            id: "brazil",
            name: "Brazil",
            theme: "brazil-theme",
            startingBudget: 60,
            startingApproval: 55,
            startingGrid: 75,
            startingEmissions: 100,
            techLevels: { solar: 50, wind: 55, storage: 40, nuclear: 20, grid: 60 },
            strengths: [
                "Hydropower Foundation: 60% of electricity already renewable",
                "Bioenergy Expertise: +30% effectiveness in biomass/biofuels",
                "Agricultural Superpower: Carbon sequestration potential",
                "Resource Abundance: Diverse clean energy potential"
            ],
            challenges: [
                "Deforestation Pressure: Land use emissions significant",
                "Regional Inequality: Uneven development and access",
                "Political Volatility: Policy consistency challenges",
                "Infrastructure Gaps: Transmission and distribution limitations"
            ],
            specialVictory: "Green Economic Powerhouse: Maintain Amazon forest while growing economy with clean energy",
            description: "A nation with an already clean electricity mix based on hydropower, with significant bioenergy potential, but facing deforestation pressures and political instability."
        }
    ],
    investments: {
        "usa": {
            "turn1": [], "turn2": [], "turn3": [], "turn4": [], "turn5": []
        },
        "china": {
            "turn1": [], "turn2": [], "turn3": [], "turn4": [], "turn5": []
        },
        "india": {
            "turn1": [], "turn2": [], "turn3": [], "turn4": [], "turn5": []
        },
        "germany": {
            "turn1": [], "turn2": [], "turn3": [], "turn4": [], "turn5": []
        },
        "brazil": {
            "turn1": [], "turn2": [], "turn3": [], "turn4": [], "turn5": []
        }
    },
    
    // Policies for each country
    policies: {
        usa: {
            turn1: [
                {
                    id: "clean-energy-standard",
                    name: "Federal Clean Energy Standard",
                    description: "Establish a national clean energy standard requiring utilities to increase clean energy in their portfolios.",
                    effects: {
                        publicApproval: -5,
                        emissions: -10
                    },
                    unlocks: "Additional renewable investments",
                    risk: "Low"
                },
                {
                    id: "carbon-pricing",
                    name: "Carbon Pricing Framework",
                    description: "Implement a carbon price across the economy to create market incentives for emissions reduction.",
                    effects: {
                        publicApproval: -10,
                        budget: 15,
                        emissions: -3
                    },
                    risk: "High"
                },
                {
                    id: "state-federal",
                    name: "State-Federal Climate Partnership",
                    description: "Create a coordinated approach between federal and state governments to implement climate policies.",
                    cost: 10,
                    effects: {
                        publicApproval: 10
                    },
                    risk: "Low"
                },
                {
                    id: "tax-credits",
                    name: "Clean Energy Tax Credits Extension",
                    description: "Extend and expand tax credits for renewable energy, energy storage, and electric vehicles.",
                    cost: 15,
                    effects: {
                        emissions: -5
                    },
                    risk: "Low"
                }
            ],
            turn2: [
                {
                    id: "clean-finance",
                    name: "Clean Energy Infrastructure Finance Corporation",
                    description: "Establish a government-backed entity to provide low-cost financing for clean energy projects.",
                    cost: 30,
                    effects: {
                        emissions: -7,
                        budget: -5
                    },
                    risk: "Medium"
                },
                {
                    id: "industrial-roadmap",
                    name: "Industrial Decarbonization Roadmap",
                    description: "Develop a comprehensive plan for decarbonizing hard-to-abate industrial sectors.",
                    cost: 5,
                    effects: {
                        emissions: -3
                    },
                    risk: "Low"
                },
                {
                    id: "climate-security",
                    name: "Climate National Security Directive",
                    description: "Designate climate change as a national security priority, directing military installations to adopt clean energy.",
                    cost: 10,
                    effects: {
                        gridStability: 5,
                        emissions: -2
                    },
                    risk: "Low"
                },
                {
                    id: "ev-acceleration",
                    name: "EV Market Acceleration",
                    description: "Implement a suite of policies to accelerate electric vehicle adoption, including incentives and charging infrastructure.",
                    cost: 20,
                    effects: {
                        emissions: -5,
                        publicApproval: 5
                    },
                    risk: "Medium"
                }
            ],
            turn3: [
                {
                    id: "export-initiative",
                    name: "Clean Energy Export Initiative",
                    description: "Create a coordinated program to promote U.S. clean energy technology exports worldwide.",
                    cost: 15,
                    effects: {
                        budget: 10
                    },
                    risk: "Medium"
                },
                {
                    id: "transition-authority",
                    name: "National Energy Transition Authority",
                    description: "Establish a dedicated agency to coordinate all aspects of the clean energy transition.",
                    cost: 10,
                    effects: {
                        emissions: -5,
                        gridStability: 5
                    },
                    risk: "Low"
                },
                {
                    id: "fossil-transition",
                    name: "Fossil Fuel Community Transition Fund",
                    description: "Provide economic support and diversification for regions historically dependent on fossil fuel industries.",
                    cost: 20,
                    effects: {
                        publicApproval: 15
                    },
                    risk: "Low"
                },
                {
                    id: "carbon-border",
                    name: "Carbon Border Adjustment Mechanism",
                    description: "Implement a carbon-based tariff on imports from countries without comparable climate policies.",
                    cost: 5,
                    effects: {
                        emissions: -3,
                        publicApproval: -5
                    },
                    risk: "High"
                }
            ],
            turn4: [
                {
                    id: "zero-electricity",
                    name: "Zero-Carbon Electricity Standard",
                    description: "Mandate 100% zero-carbon electricity by 2045 with binding interim targets.",
                    effects: {
                        publicApproval: -5,
                        emissions: -15
                    },
                    risk: "Medium"
                },
                {
                    id: "climate-bank",
                    name: "National Climate Bank",
                    description: "Establish a public financial institution dedicated to leveraging private investment in climate solutions.",
                    cost: 50,
                    effects: {
                        emissions: -10,
                        budget: -5
                    },
                    risk: "Low"
                },
                {
                    id: "energy-access",
                    name: "Universal Clean Energy Access Program",
                    description: "Ensure all communities have access to affordable clean energy, focusing on underserved populations.",
                    cost: 15,
                    effects: {
                        publicApproval: 20
                    },
                    risk: "Low"
                },
                {
                    id: "moonshot",
                    name: "Scientific Moonshot Initiatives",
                    description: "Launch ambitious research programs to achieve breakthrough technologies in clean energy.",
                    cost: 20,
                    effects: {
                        publicApproval: 5
                    },
                    risk: "Very High"
                }
            ],
            turn5: [
                {
                    id: "carbon-neutrality",
                    name: "Economy-Wide Carbon Neutrality Target",
                    description: "Enact legislation establishing a legally binding economy-wide carbon neutrality target by 2050.",
                    effects: {
                        publicApproval: -10,
                        emissions: -20
                    },
                    risk: "Medium"
                },
                {
                    id: "global-alliance",
                    name: "Global Clean Technology Alliance",
                    description: "Form an international alliance focused on accelerating clean technology development and deployment.",
                    cost: 10,
                    effects: {
                        budget: 5,
                        emissions: -5
                    },
                    risk: "Low"
                },
                {
                    id: "climate-dividend",
                    name: "Climate Dividend Program",
                    description: "Return carbon tax revenues directly to citizens as regular dividend payments.",
                    effects: {
                        publicApproval: 25
                    },
                    risk: "Low"
                },
                {
                    id: "adaptation-plan",
                    name: "National Climate Adaptation Plan",
                    description: "Implement a comprehensive strategy to prepare communities and infrastructure for climate impacts.",
                    cost: 25,
                    effects: {
                        gridStability: 10,
                        publicApproval: 5
                    },
                    risk: "Low"
                }
            ]
        },
        
        china: {
            turn1: [
                {
                    id: "five-year-plan",
                    name: "14th Five-Year Plan Clean Energy Targets",
                    description: "Incorporate ambitious clean energy and emissions targets into the national five-year plan.",
                    cost: 10,
                    effects: {
                        emissions: -5
                    },
                    risk: "Low"
                },
                {
                    id: "renewable-standard",
                    name: "Renewable Portfolio Standard",
                    description: "Implement mandatory renewable energy targets for power companies across provinces.",
                    cost: 5,
                    effects: {
                        emissions: -8
                    },
                    risk: "Medium"
                },
                {
                    id: "carbon-trading",
                    name: "Carbon Trading System Expansion",
                    description: "Expand and strengthen the national emissions trading system to cover more sectors and increase prices.",
                    cost: 3,
                    effects: {
                        budget: 5,
                        emissions: -5
                    },
                    risk: "Medium"
                },
                {
                    id: "materials-security",
                    name: "Critical Materials Security Initiative",
                    description: "Secure supply chains for rare earth elements and other critical materials needed for clean technology.",
                    cost: 15,
                    effects: {
                        budget: 3
                    },
                    risk: "Medium"
                }
            ],
            turn2: [
                {
                    id: "china_wind_power_expansion_t2",
                    name: "Large-Scale Wind Power Expansion",
                    description: "Aggressively expand onshore and offshore wind capacity.",
                    minCost: 30,
                    maxCost: 70,
                    risk: "Low",
                    longTerm: "Significant CO2 reduction and wind tech improvement.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        techWind: cost => Math.floor(cost / 5)
                    }
                },
                {
                    id: "china_ev_infrastructure_t2",
                    name: "Electric Vehicle Charging Infrastructure",
                    description: "Rapidly build out a national EV charging network.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Low",
                    longTerm: "Accelerates EV adoption, reducing transport emissions.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 7), // Transport sector
                        publicApproval: 5
                    }
                },
                {
                    id: "china_concentrated_solar_t2",
                    name: "Concentrated Solar Power Base",
                    description: "Develop large-scale solar thermal power plants with energy storage capabilities.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Medium",
                    longTerm: "Provides dispatchable solar power for day and night operation.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        gridStability: cost => Math.floor(cost / 10) + 5, // Dispatchable solar
                        techSolar: cost => Math.floor(cost / 6)
                    }
                },
                {
                    id: "china_advanced_nuclear_t2",
                    name: "Advanced Nuclear Fleet",
                    description: "Construct new generation nuclear plants for clean baseload power.",
                    minCost: 40,
                    maxCost: 90,
                    risk: "Medium",
                    longTerm: "Provides massive low-carbon baseload electricity.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        gridStability: cost => Math.floor(cost / 6) + 5,
                        techNuclear: cost => Math.floor(cost / 7)
                    }
                }
            ],
            turn3: [
                {
                    id: "china_green_hydrogen_t3",
                    name: "Green Hydrogen Production Pilot",
                    description: "Invest in facilities to produce hydrogen using renewable energy.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "High",
                    longTerm: "Potential for decarbonizing industry and transport.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 8) // Future potential
                    }
                },
                {
                    id: "china_smart_grid_ai_t3",
                    name: "Smart Grid Artificial Intelligence",
                    description: "Implement AI-powered grid management to optimize renewable energy integration.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Enables higher renewable energy penetration and grid efficiency.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 3) + 5,
                        techGrid: cost => Math.floor(cost / 4),
                        emissions: cost => -Math.floor(cost / 9) // Indirect effect through efficiency
                    }
                },
                {
                    id: "china_floating_solar_t3",
                    name: "Floating Solar Arrays",
                    description: "Deploy large-scale solar installations on reservoirs and lakes.",
                    minCost: 20, 
                    maxCost: 45,
                    risk: "Medium",
                    longTerm: "Expands solar capacity without using land resources.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 4),
                        techSolar: cost => Math.floor(cost / 6)
                    }
                },
                {
                    id: "china_energy_storage_manufacturing_t3",
                    name: "Advanced Energy Storage Manufacturing",
                    description: "Expand production of next-generation battery technologies.",
                    minCost: 30,
                    maxCost: 65,
                    risk: "Medium",
                    longTerm: "Global leadership in energy storage technology and exports.",
                    effects: {
                        techStorage: cost => Math.floor(cost / 3),
                        budget: cost => Math.floor(cost / 6), // Export revenue
                        gridStability: cost => Math.floor(cost / 10) // Indirect stability benefit
                    }
                }
            ],
            turn4: [
                {
                    id: "china_advanced_nuclear_t4",
                    name: "Deploy Advanced Nuclear Reactors",
                    description: "Construct new generation nuclear plants for baseload power.",
                    minCost: 40,
                    maxCost: 100,
                    risk: "Medium",
                    longTerm: "Large scale low-carbon electricity.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 2),
                        techNuclear: cost => Math.floor(cost / 6),
                        gridStability: cost => Math.floor(cost / 10),
                        publicApproval: -10
                    }
                },
                {
                    id: "china_carbon_capture_industrial_t4",
                    name: "Carbon Capture Industrial Clusters",
                    description: "Deploy carbon capture technologies in industrial zones with high emissions concentration.",
                    minCost: 35,
                    maxCost: 75,
                    risk: "Medium",
                    longTerm: "Decarbonizes heavy industry while maintaining production.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        publicApproval: 5, // Addresses visible pollution
                        techGrid: cost => Math.floor(cost / 10) // Integration technologies
                    }
                },
                {
                    id: "china_national_energy_storage_t4",
                    name: "National Energy Storage Network",
                    description: "Deploy a coordinated nationwide network of various energy storage technologies.",
                    minCost: 30,
                    maxCost: 60,
                    risk: "Medium",
                    longTerm: "Enables very high renewable energy penetration and grid stability.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 3) + 5,
                        techStorage: cost => Math.floor(cost / 5),
                        emissions: cost => -Math.floor(cost / 6) // Enables more renewables
                    }
                }
            ],
            turn5: [
                {
                    id: "china_smart_cities_t5",
                    name: "Smart Cities Energy Integration",
                    description: "Implement city-wide smart grid and energy efficiency systems.",
                    minCost: 25,
                    maxCost: 60,
                    risk: "Medium",
                    longTerm: "Highly efficient urban energy use.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        gridStability: cost => Math.floor(cost / 8),
                        techGrid: cost => Math.floor(cost / 6),
                        publicApproval: 5
                    }
                },
                {
                    id: "china_breakthrough_energy_research_t5",
                    name: "Breakthrough Energy Research Park",
                    description: "Create a massive research complex focused on next-generation energy technologies.",
                    minCost: 40,
                    maxCost: 100,
                    risk: "Very High",
                    longTerm: "Potential for revolutionary clean energy breakthroughs.",
                    effects: {
                        techSolar: cost => Math.floor(cost / 10) + 5,
                        techWind: cost => Math.floor(cost / 10) + 5,
                        techStorage: cost => Math.floor(cost / 10) + 5,
                        techNuclear: cost => Math.floor(cost / 10) + 5,
                        techGrid: cost => Math.floor(cost / 10) + 5
                    }
                },
                {
                    id: "china_global_clean_energy_infrastructure_t5",
                    name: "Global Clean Energy Infrastructure",
                    description: "Invest in clean energy projects worldwide to secure influence and export markets.",
                    minCost: 50,
                    maxCost: 120,
                    risk: "Medium",
                    longTerm: "Global leadership in clean energy exports and technology standards.",
                    effects: {
                        budget: cost => Math.floor(cost / 3), // Export revenue
                        publicApproval: 10, // National pride
                        emissions: cost => -Math.floor(cost / 8) // Global emission reductions
                    }
                },
                {
                    id: "china_carbon_removal_infrastructure_t5",
                    name: "Carbon Dioxide Removal Infrastructure",
                    description: "Build large-scale direct air capture facilities and enhanced carbon sinks.",
                    minCost: 30,
                    maxCost: 80,
                    risk: "High",
                    longTerm: "Potential for negative emissions and climate restoration.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3), // Direct reduction
                        publicApproval: 5, // Climate leadership
                        techGrid: cost => Math.floor(cost / 10) // System integration
                    }
                }
            ]
        },
        india: {
            turn1: [
                {
                    id: "climate-finance",
                    name: "International Climate Finance Framework",
                    description: "Establish mechanisms to attract and effectively utilize international climate funding.",
                    cost: 1,
                    effects: {
                        budget: 20
                    },
                    risk: "Low"
                },
                {
                    id: "renewable-obligations",
                    name: "Renewable Purchase Obligations",
                    description: "Strengthen and enforce renewable energy purchase requirements for utilities.",
                    cost: 2,
                    effects: {
                        emissions: -5
                    },
                    risk: "Medium"
                },
                {
                    id: "efficiency-standards",
                    name: "Energy Efficiency Standards",
                    description: "Implement comprehensive efficiency standards for appliances, buildings, and industry.",
                    cost: 3,
                    effects: {
                        emissions: -3
                    },
                    risk: "Low"
                },
                {
                    id: "coal-cess",
                    name: "Clean Energy Cess on Coal",
                    description: "Increase the tax on coal to fund clean energy development.",
                    effects: {
                        publicApproval: -5,
                        budget: 5
                    },
                    risk: "Medium"
                },
                {
                    id: "india_solar_irrigation_t1",
                    name: "Solar Powered Irrigation Pumps",
                    description: "Replace diesel pumps with solar for agricultural use.",
                    minCost: 10,
                    maxCost: 30,
                    risk: "Low",
                    longTerm: "Reduces agricultural emissions and improves farmer income.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        publicApproval: cost => Math.floor(cost / 7) + 3,
                        techSolar: cost => Math.floor(cost / 8)
                    }
                },
                {
                    id: "india_grid_strengthening_t1",
                    name: "Grid Strengthening Project",
                    description: "Upgrade transmission infrastructure to reduce losses and improve reliability.",
                    minCost: 7,
                    maxCost: 18,
                    risk: "Medium",
                    longTerm: "Essential foundation for renewable integration.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 2),
                        techGrid: cost => Math.floor(cost / 6)
                    }
                },
                {
                    id: "india_solar_manufacturing_t1",
                    name: "Solar Manufacturing Initiative",
                    description: "Develop domestic solar panel manufacturing capabilities.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Medium",
                    longTerm: "Reduces solar costs and ensures supply chain security.",
                    effects: {
                        techSolar: cost => Math.floor(cost / 3),
                        budget: cost => -Math.floor(cost / 4), // Short-term cost
                        publicApproval: 5 // Creates jobs
                    }
                },
                {
                    id: "india_rural_microgrid_t1",
                    name: "Rural Microgrid Program",
                    description: "Establish renewable-based microgrids for energy access in remote villages.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Low",
                    longTerm: "Provides clean energy access to underserved communities.",
                    effects: {
                        publicApproval: cost => Math.floor(cost / 3) + 5,
                        emissions: cost => -Math.floor(cost / 10)
                    }
                },
                {
                    id: "india_wind_energy_corridor_t2",
                    name: "Wind Energy Corridors",
                    description: "Develop high-potential wind regions with dedicated transmission.",
                    minCost: 10,
                    maxCost: 25,
                    risk: "Medium",
                    longTerm: "Diversifies renewable mix with complementary generation profile to solar.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        techWind: cost => Math.floor(cost / 6)
                    }
                },
                {
                    id: "usa_nuclear_small_modular_t2",
                    name: "Invest in Small Modular Reactors (SMRs)",
                    description: "Pilot program for advanced, safer nuclear reactors.",
                    minCost: 30,
                    maxCost: 70,
                    risk: "High",
                    longTerm: "Potential for large-scale, low-carbon baseload power.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 2),
                        publicApproval: cost => -Math.floor(cost / 10), // Nuclear often has approval challenges
                        techNuclear: cost => Math.floor(cost / 5),
                        gridStability: cost => Math.floor(cost/7)
                    }
                }
            ],
            turn2: [
                {
                    id: "usa_carbon_capture_pilot_t3",
                    name: "Carbon Capture Utilization & Storage (CCUS) Pilot",
                    description: "Invest in CCUS technology for industrial sectors.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Very High",
                    longTerm: "Potential to decarbonize hard-to-abate sectors.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 6),
                        publicApproval: -5
                    }
                }
            ],
            turn3: [
                {
                    id: "usa_direct_air_capture_t4",
                    name: "Direct Air Capture (DAC) Research",
                    description: "Fund research into technologies that remove CO2 directly from the atmosphere.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Very High",
                    longTerm: "Could provide negative emissions if successful and scalable.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 10) // Represents future potential
                    }
                }
            ],
            turn4: [
                {
                    id: "usa_fusion_research_t5",
                    name: "Fusion Energy Research Initiative",
                    description: "Long-term investment in the quest for fusion power.",
                    minCost: 30,
                    maxCost: 80,
                    risk: "Very High",
                    longTerm: "Game-changing clean energy source if achieved.",
                    effects: {
                        // No immediate emission effect, this is for the far future
                        publicApproval: 5 // Visionary project
                    }
                }
            ]
        },
        china: {
            turn1: [
                {
                    id: "china_solar_manufacturing_t1",
                    name: "Expand Solar Panel Manufacturing",
                    description: "Increase domestic production capacity for solar panels.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Low",
                    longTerm: "Strengthens global solar supply chain leadership and boosts solar tech.",
                    effects: {
                        budget: cost => Math.floor(cost / 10), // Exports can generate revenue
                        emissions: cost => -Math.floor(cost / 6),
                        techSolar: cost => Math.floor(cost / 4)
                    }
                },
                {
                    id: "china_long_distance_transmission_t1",
                    name: "UHV Transmission Lines",
                    description: "Build ultra-high-voltage lines to transmit renewable energy from remote areas.",
                    minCost: 25,
                    maxCost: 60,
                    risk: "Medium",
                    longTerm: "Enables massive renewable integration and improves grid tech.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 4),
                        techGrid: cost => Math.floor(cost / 5),
                        emissions: cost => -Math.floor(cost/7)
                    }
                },
                {
                    id: "china_battery_gigafactories_t1",
                    name: "Advanced Battery Gigafactories",
                    description: "Create massive battery manufacturing facilities for energy storage and EVs.",
                    minCost: 25,
                    maxCost: 60,
                    risk: "Medium",
                    longTerm: "Energy storage market leadership and export revenue.",
                    effects: {
                        techStorage: cost => Math.floor(cost / 4),
                        budget: cost => Math.floor(cost / 12), // Export revenue
                        emissions: cost => -Math.floor(cost / 10) // Enables future renewable integration
                    }
                },
                {
                    id: "china_ev_manufacturing_t1",
                    name: "EV Manufacturing Ecosystem",
                    description: "Develop large-scale electric vehicle manufacturing infrastructure.",
                    minCost: 30,
                    maxCost: 70,
                    risk: "Low",
                    longTerm: "Global EV market leadership and transport emission reduction.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 8), // Transport sector emissions
                        budget: cost => Math.floor(cost / 7), // Export revenue
                        publicApproval: 5 // Popular industrial policy
                    }
                },
                {
                    id: "china_coal_efficiency_t1",
                    name: "Coal Plant Efficiency & Controls",
                    description: "Upgrade existing coal plants with efficiency improvements and pollution controls.",
                    minCost: 20,
                    maxCost: 40,
                    risk: "Low",
                    longTerm: "Reduces emissions while extending plant life with reduced pollution.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        gridStability: cost => Math.floor(cost / 8),
                        publicApproval: 5 // Addresses visible air pollution
                    }
                }
            ],
            turn2: [
                {
                    id: "china_wind_power_expansion_t2",
                    name: "Large-Scale Wind Power Expansion",
                    description: "Aggressively expand onshore and offshore wind capacity.",
                    minCost: 30,
                    maxCost: 70,
                    risk: "Low",
                    longTerm: "Significant CO2 reduction and wind tech improvement.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        techWind: cost => Math.floor(cost / 5)
                    }
                },
                {
                    id: "china_ev_infrastructure_t2",
                    name: "Electric Vehicle Charging Infrastructure",
                    description: "Rapidly build out a national EV charging network.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Low",
                    longTerm: "Accelerates EV adoption, reducing transport emissions.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 7), // Transport sector
                        publicApproval: 5
                    }
                },
                {
                    id: "china_concentrated_solar_t2",
                    name: "Concentrated Solar Power Base",
                    description: "Develop large-scale solar thermal power plants with energy storage capabilities.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Medium",
                    longTerm: "Provides dispatchable solar power for day and night operation.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        gridStability: cost => Math.floor(cost / 10) + 5, // Dispatchable solar
                        techSolar: cost => Math.floor(cost / 6)
                    }
                },
                {
                    id: "china_advanced_nuclear_t2",
                    name: "Advanced Nuclear Fleet",
                    description: "Construct new generation nuclear plants for clean baseload power.",
                    minCost: 40,
                    maxCost: 90,
                    risk: "Medium",
                    longTerm: "Provides massive low-carbon baseload electricity.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        gridStability: cost => Math.floor(cost / 6) + 5,
                        techNuclear: cost => Math.floor(cost / 7)
                    }
                }
            ],
            turn3: [
                {
                    id: "china_green_hydrogen_t3",
                    name: "Green Hydrogen Production Pilot",
                    description: "Invest in facilities to produce hydrogen using renewable energy.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "High",
                    longTerm: "Potential for decarbonizing industry and transport.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 8) // Future potential
                    }
                },
                {
                    id: "china_smart_grid_ai_t3",
                    name: "Smart Grid Artificial Intelligence",
                    description: "Implement AI-powered grid management to optimize renewable energy integration.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Enables higher renewable energy penetration and grid efficiency.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 3) + 5,
                        techGrid: cost => Math.floor(cost / 4),
                        emissions: cost => -Math.floor(cost / 9) // Indirect effect through efficiency
                    }
                },
                {
                    id: "china_floating_solar_t3",
                    name: "Floating Solar Arrays",
                    description: "Deploy large-scale solar installations on reservoirs and lakes.",
                    minCost: 20, 
                    maxCost: 45,
                    risk: "Medium",
                    longTerm: "Expands solar capacity without using land resources.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 4),
                        techSolar: cost => Math.floor(cost / 6)
                    }
                },
                {
                    id: "china_energy_storage_manufacturing_t3",
                    name: "Advanced Energy Storage Manufacturing",
                    description: "Expand production of next-generation battery technologies.",
                    minCost: 30,
                    maxCost: 65,
                    risk: "Medium",
                    longTerm: "Global leadership in energy storage technology and exports.",
                    effects: {
                        techStorage: cost => Math.floor(cost / 3),
                        budget: cost => Math.floor(cost / 6), // Export revenue
                        gridStability: cost => Math.floor(cost / 10) // Indirect stability benefit
                    }
                }
            ],
            turn4: [
                {
                    id: "china_advanced_nuclear_t4",
                    name: "Deploy Advanced Nuclear Reactors",
                    description: "Construct new generation nuclear plants for baseload power.",
                    minCost: 40,
                    maxCost: 100,
                    risk: "Medium",
                    longTerm: "Large scale low-carbon electricity.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 2),
                        techNuclear: cost => Math.floor(cost / 6),
                        gridStability: cost => Math.floor(cost / 10),
                        publicApproval: -10
                    }
                },
                {
                    id: "china_carbon_capture_industrial_t4",
                    name: "Carbon Capture Industrial Clusters",
                    description: "Deploy carbon capture technologies in industrial zones with high emissions concentration.",
                    minCost: 35,
                    maxCost: 75,
                    risk: "Medium",
                    longTerm: "Decarbonizes heavy industry while maintaining production.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        publicApproval: 5, // Addresses visible pollution
                        techGrid: cost => Math.floor(cost / 10) // Integration technologies
                    }
                },
                {
                    id: "china_national_energy_storage_t4",
                    name: "National Energy Storage Network",
                    description: "Deploy a coordinated nationwide network of various energy storage technologies.",
                    minCost: 30,
                    maxCost: 60,
                    risk: "Medium",
                    longTerm: "Enables very high renewable energy penetration and grid stability.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 3) + 5,
                        techStorage: cost => Math.floor(cost / 5),
                        emissions: cost => -Math.floor(cost / 6) // Enables more renewables
                    }
                }
            ],
            turn5: [
                {
                    id: "china_smart_cities_t5",
                    name: "Smart Cities Energy Integration",
                    description: "Implement city-wide smart grid and energy efficiency systems.",
                    minCost: 25,
                    maxCost: 60,
                    risk: "Medium",
                    longTerm: "Highly efficient urban energy use.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5),
                        gridStability: cost => Math.floor(cost / 8),
                        techGrid: cost => Math.floor(cost / 6),
                        publicApproval: 5
                    }
                },
                {
                    id: "china_breakthrough_energy_research_t5",
                    name: "Breakthrough Energy Research Park",
                    description: "Create a massive research complex focused on next-generation energy technologies.",
                    minCost: 40,
                    maxCost: 100,
                    risk: "Very High",
                    longTerm: "Potential for revolutionary clean energy breakthroughs.",
                    effects: {
                        techSolar: cost => Math.floor(cost / 10) + 5,
                        techWind: cost => Math.floor(cost / 10) + 5,
                        techStorage: cost => Math.floor(cost / 10) + 5,
                        techNuclear: cost => Math.floor(cost / 10) + 5,
                        techGrid: cost => Math.floor(cost / 10) + 5
                    }
                },
                {
                    id: "china_global_clean_energy_infrastructure_t5",
                    name: "Global Clean Energy Infrastructure",
                    description: "Invest in clean energy projects worldwide to secure influence and export markets.",
                    minCost: 50,
                    maxCost: 120,
                    risk: "Medium",
                    longTerm: "Global leadership in clean energy exports and technology standards.",
                    effects: {
                        budget: cost => Math.floor(cost / 3), // Export revenue
                        publicApproval: 10, // National pride
                        emissions: cost => -Math.floor(cost / 8) // Global emission reductions
                    }
                },
                {
                    id: "china_carbon_removal_infrastructure_t5",
                    name: "Carbon Dioxide Removal Infrastructure",
                    description: "Build large-scale direct air capture facilities and enhanced carbon sinks.",
                    minCost: 30,
                    maxCost: 80,
                    risk: "High",
                    longTerm: "Potential for negative emissions and climate restoration.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3), // Direct reduction
                        publicApproval: 5, // Climate leadership
                        techGrid: cost => Math.floor(cost / 10) // System integration
                    }
                }
            ]
        },
        india: {
            turn1: [
                {
                    id: "brazil_hydropower_modernization_t1",
                    name: "Hydropower Plant Modernization",
                    description: "Upgrade existing hydropower facilities for efficiency and environmental performance.",
                    minCost: 10,
                    maxCost: 30,
                    risk: "Low",
                    longTerm: "Maintains high renewable share and improves sustainability.",
                    effects: {
                        gridStability: cost => Math.floor(cost / 6),
                        emissions: cost => -Math.floor(cost/10) // Small reduction from efficiency
                    }
                }
            ],
            turn2: [
                {
                    id: "brazil_bioenergy_expansion_t2",
                    name: "Sustainable Bioenergy Expansion",
                    description: "Increase production of biofuels and biomass energy using sustainable sources.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Medium", // Sustainability can be a risk
                    longTerm: "Strengthens bioenergy sector, reduces transport emissions.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 5)
                    }
                }
            ],
            turn3: [
                {
                    id: "brazil_amazon_reforestation_tech_t3",
                    name: "Reforestation & Monitoring Technology",
                    description: "Invest in technology for large-scale reforestation and real-time deforestation monitoring in the Amazon.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Medium",
                    longTerm: "Significant carbon sequestration and biodiversity benefits.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 2), // Land-use change is a major factor
                        publicApproval: cost => Math.floor(cost / 7) + 5
                    }
                }
            ],
            turn4: [
                {
                    id: "brazil_wind_northeast_t4",
                    name: "Expand Wind Power in Northeast",
                    description: "Develop vast wind potential in Brazil's northeastern region.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Low",
                    longTerm: "Diversifies renewable mix and provides clean energy.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 4),
                        techWind: cost => Math.floor(cost / 6)
                    }
                }
            ],
            turn5: [
                 {
                    id: "brazil_sustainable_agriculture_t5",
                    name: "Nationwide Sustainable Agriculture Program",
                    description: "Promote farming practices that reduce emissions and sequester carbon.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Low",
                    longTerm: "Reduces agricultural emissions and improves soil health.",
                    effects: {
                        emissions: cost => -Math.floor(cost / 3),
                        publicApproval: 5
                    }
                }
            ]
        }
    },
    
    events: {
        environmental: [
            {
                id: "heat-wave",
                name: "Record Heat Wave",
                description: "An unprecedented heat wave has struck the country, straining the power grid as cooling demand soars.",
                effects: {
                    publicApproval: -5,
                    gridStability: -10
                },
                responses: [
                    {
                        id: "emergency-management",
                        name: "Emergency Grid Management",
                        description: "Implement emergency measures to prevent blackouts, including paying industrial users to reduce consumption.",
                        cost: 5,
                        effects: {
                            gridStability: 10
                        }
                    },
                    {
                        id: "nothing",
                        name: "Do Nothing",
                        description: "Allow utilities to manage the situation through existing protocols.",
                        effects: {
                            gridStability: -5,
                            publicApproval: -10
                        }
                    }
                ]
            },
            {
                id: "flooding",
                name: "Flooding Damages Infrastructure",
                description: "Severe flooding has damaged critical energy infrastructure in multiple regions.",
                effects: {
                    gridStability: -10,
                    publicApproval: -5
                },
                responses: [
                    {
                        id: "emergency-repairs",
                        name: "Emergency Repairs",
                        description: "Focus on quickly restoring the damaged infrastructure to its previous state.",
                        cost: 10,
                        effects: {
                            gridStability: 10
                        }
                    },
                    {
                        id: "resilient-rebuild",
                        name: "Climate-Resilient Rebuild",
                        description: "Rebuild infrastructure with enhanced resilience to future climate impacts.",
                        cost: 15,
                        effects: {
                            gridStability: 5,
                            publicApproval: 5
                        }
                    },
                    {
                        id: "minimal-fixes",
                        name: "Minimal Fixes",
                        description: "Address only the most critical problems to minimize costs.",
                        cost: 5,
                        effects: {
                            gridStability: 5,
                            publicApproval: -5
                        }
                    }
                ]
            },
            {
                id: "drought",
                name: "Severe Drought Impacts Energy",
                description: "A prolonged drought has reduced hydropower output and limited cooling water for thermal plants.",
                effects: {
                    gridStability: -15,
                    publicApproval: -5
                },
                responses: [
                    {
                        id: "energy-imports",
                        name: "Emergency Energy Imports",
                        description: "Import electricity from neighboring regions to make up the shortfall.",
                        cost: 8,
                        effects: {
                            gridStability: 10,
                            budget: -5
                        }
                    },
                    {
                        id: "accelerate-alternatives",
                        name: "Accelerate Alternative Renewables",
                        description: "Fast-track solar and wind projects that don't require water resources.",
                        cost: 12,
                        effects: {
                            emissions: -5,
                            gridStability: 5
                        }
                    },
                    {
                        id: "water-management",
                        name: "Water Management Overhaul",
                        description: "Implement comprehensive water conservation and management strategies.",
                        cost: 10,
                        effects: {
                            gridStability: 10,
                            publicApproval: 5
                        }
                    }
                ]
            },
            {
                id: "biodiversity-crisis",
                name: "Biodiversity Crisis",
                description: "Scientists warn that accelerating biodiversity loss threatens ecosystem services critical to human wellbeing.",
                effects: {
                    publicApproval: -5
                },
                responses: [
                    {
                        id: "conservation-initiative",
                        name: "Conservation Initiative",
                        description: "Launch a major program to protect biodiversity and restore ecosystems.",
                        cost: 7,
                        effects: {
                            publicApproval: 10,
                            emissions: -3
                        }
                    },
                    {
                        id: "pr-campaign",
                        name: "Public Relations Campaign",
                        description: "Highlight existing environmental protection efforts without new commitments.",
                        cost: 3,
                        effects: {
                            publicApproval: 5
                        }
                    },
                    {
                        id: "international-partnership",
                        name: "International Partnership",
                        description: "Form an alliance with other countries to address biodiversity loss globally.",
                        cost: 5,
                        effects: {
                            publicApproval: 8,
                            budget: 2
                        }
                    }
                ]
            }
        ],
        
        technological: [
            {
                id: "battery-breakthrough",
                name: "Battery Breakthrough",
                description: "Scientists have achieved a major breakthrough in battery technology, potentially reducing costs by 30%.",
                effects: {
                    gridStability: 5
                },
                responses: [
                    {
                        id: "domestic-production",
                        name: "Invest in Domestic Production",
                        description: "Fund rapid commercialization and domestic manufacturing of the new technology.",
                        cost: 10,
                        effects: {
                            gridStability: 10,
                            emissions: -5,
                            budget: 5
                        }
                    },
                    {
                        id: "license-technology",
                        name: "License Technology",
                        description: "Support licensing agreements to integrate the technology without direct manufacturing.",
                        cost: 5,
                        effects: {
                            gridStability: 5,
                            emissions: -3
                        }
                    }
                ]
            },
            {
                id: "research-collaboration",
                name: "International Research Collaboration Offer",
                description: "A major international research initiative on next-generation clean energy technologies is seeking participants.",
                responses: [
                    {
                        id: "join-initiative",
                        name: "Join Initiative",
                        description: "Commit funding and researchers to the international collaboration.",
                        cost: 5,
                        effects: {
                            emissions: -5,
                            budget: 2
                        }
                    },
                    {
                        id: "national-programs",
                        name: "Focus on National Programs",
                        description: "Maintain focus on domestic research programs to maximize national benefits.",
                        effects: {
                            budget: -2
                        }
                    }
                ]
            },
            {
                id: "grid-failure",
                name: "Grid Failure Event",
                description: "A major grid failure has caused widespread blackouts affecting millions of people.",
                effects: {
                    publicApproval: -20,
                    gridStability: -15
                },
                responses: [
                    {
                        id: "emergency-restoration",
                        name: "Emergency Restoration",
                        description: "Focus all resources on quickly restoring power to affected areas.",
                        cost: 12,
                        effects: {
                            gridStability: 10,
                            publicApproval: 10
                        }
                    },
                    {
                        id: "system-overhaul",
                        name: "System Overhaul",
                        description: "Use the crisis as an opportunity to modernize the affected grid sections.",
                        cost: 20,
                        effects: {
                            gridStability: 20,
                            publicApproval: 5
                        }
                    },
                    {
                        id: "targeted-fixes",
                        name: "Targeted Fixes",
                        description: "Address the most critical vulnerabilities while minimizing costs.",
                        cost: 8,
                        effects: {
                            gridStability: 5,
                            publicApproval: 5
                        }
                    }
                ]
            },
            {
                id: "nuclear-incident",
                name: "Nuclear Incident (Global)",
                description: "A nuclear accident in another country has raised public concerns about nuclear safety worldwide.",
                effects: {
                    publicApproval: -10
                },
                responses: [
                    {
                        id: "safety-review",
                        name: "Safety Review",
                        description: "Conduct a comprehensive review of domestic nuclear safety protocols.",
                        cost: 5,
                        effects: {
                            publicApproval: 5,
                            gridStability: 5
                        }
                    },
                    {
                        id: "alternative-focus",
                        name: "Alternative Clean Energy Focus",
                        description: "Shift emphasis to non-nuclear clean energy sources in public communications.",
                        cost: 10,
                        effects: {
                            publicApproval: 10,
                            emissions: -5
                        }
                    },
                    {
                        id: "information-campaign",
                        name: "Public Information Campaign",
                        description: "Launch a campaign to educate the public about nuclear safety measures.",
                        cost: 3,
                        effects: {
                            publicApproval: 8
                        }
                    }
                ]
            }
        ],
        
        economic: [
            {
                id: "energy-price-spike",
                name: "Fossil Fuel Price Spike",
                description: "Global prices for oil and gas have surged due to supply constraints, affecting energy costs.",
                effects: {
                    publicApproval: -10,
                    budget: -5
                },
                responses: [
                    {
                        id: "consumer-subsidies",
                        name: "Consumer Subsidies",
                        description: "Provide temporary subsidies to shield consumers from price increases.",
                        cost: 10,
                        effects: {
                            publicApproval: 10,
                            budget: -5
                        }
                    },
                    {
                        id: "accelerate-renewables",
                        name: "Accelerate Renewables",
                        description: "Use the price shock as motivation to fast-track renewable energy projects.",
                        cost: 8,
                        effects: {
                            emissions: -5,
                            publicApproval: 5
                        }
                    },
                    {
                        id: "strategic-reserve",
                        name: "Strategic Reserve Release",
                        description: "Release fuel from strategic reserves to stabilize prices temporarily.",
                        effects: {
                            publicApproval: 8,
                            budget: -3
                        }
                    }
                ]
            },
            {
                id: "clean-tech-dumping",
                name: "Foreign Clean Tech Dumping",
                description: "Foreign manufacturers are flooding the market with low-cost clean energy equipment, threatening domestic industry.",
                effects: {
                    budget: -5,
                    publicApproval: -5
                },
                responses: [
                    {
                        id: "trade-protections",
                        name: "Trade Protections",
                        description: "Implement tariffs or other measures to protect domestic manufacturers.",
                        effects: {
                            budget: 5,
                            publicApproval: 5,
                            emissions: 3
                        }
                    },
                    {
                        id: "strategic-support",
                        name: "Strategic Industry Support",
                        description: "Provide targeted support to help domestic manufacturers compete on quality and innovation.",
                        cost: 8,
                        effects: {
                            budget: 5,
                            emissions: -3
                        }
                    },
                    {
                        id: "embrace-imports",
                        name: "Embrace Cheap Imports",
                        description: "Allow market forces to work, accelerating clean energy deployment while transitioning domestic manufacturing.",
                        effects: {
                            emissions: -7,
                            budget: -5
                        }
                    }
                ]
            },
            {
                id: "economic-recession",
                name: "Economic Recession",
                description: "A global economic downturn has reduced tax revenues and increased pressure to cut spending.",
                effects: {
                    budget: -20,
                    publicApproval: -10
                },
                responses: [
                    {
                        id: "green-stimulus",
                        name: "Green Stimulus",
                        description: "Launch a major clean energy infrastructure program as counter-cyclical stimulus.",
                        cost: 15,
                        effects: {
                            budget: 10,
                            publicApproval: 10,
                            emissions: -5
                        }
                    },
                    {
                        id: "austerity",
                        name: "Austerity Measures",
                        description: "Reduce government spending, including some clean energy programs.",
                        effects: {
                            budget: 15,
                            publicApproval: -10,
                            emissions: 5
                        }
                    },
                    {
                        id: "international-financing",
                        name: "International Financing",
                        description: "Secure international climate finance to maintain momentum on key initiatives.",
                        cost: 2,
                        effects: {
                            budget: 10,
                            emissions: -3
                        }
                    }
                ]
            },
            {
                id: "investment-surge",
                name: "Private Investment Surge",
                description: "There has been a sudden surge in private investor interest in clean energy projects in your country.",
                effects: {
                    budget: 10,
                    emissions: -5
                },
                responses: [
                    {
                        id: "streamline-permitting",
                        name: "Streamline Permitting",
                        description: "Accelerate approval processes to take advantage of the investment interest.",
                        effects: {
                            budget: 5,
                            emissions: -10,
                            gridStability: -5
                        }
                    },
                    {
                        id: "strategic-direction",
                        name: "Strategic Direction",
                        description: "Guide investments toward the highest-priority areas for the energy transition.",
                        cost: 3,
                        effects: {
                            emissions: -7,
                            gridStability: 5
                        }
                    },
                    {
                        id: "public-private",
                        name: "Public-Private Partnerships",
                        description: "Form partnerships to leverage private capital with public goals.",
                        cost: 5,
                        effects: {
                            budget: 10,
                            emissions: -5,
                            publicApproval: 5
                        }
                    }
                ]
            }
        ],
        
        social: [
            {
                id: "climate-protests",
                name: "Climate Protest Movement",
                description: "A massive climate protest movement has emerged, demanding faster and more ambitious climate action.",
                effects: {
                    publicApproval: -5
                },
                responses: [
                    {
                        id: "engage-demands",
                        name: "Engage With Demands",
                        description: "Meet with movement leaders and accelerate climate policies in response.",
                        effects: {
                            publicApproval: 10,
                            emissions: -5,
                            budget: -5
                        }
                    },
                    {
                        id: "moderate-response",
                        name: "Moderate Response",
                        description: "Acknowledge concerns while maintaining existing policy timelines.",
                        effects: {
                            publicApproval: 5
                        }
                    },
                    {
                        id: "minimize-disruption",
                        name: "Minimize Disruption",
                        description: "Focus on maintaining order and continuing existing plans.",
                        effects: {
                            publicApproval: -10
                        }
                    }
                ]
            },
            {
                id: "industry-lobbying",
                name: "Industry Lobbying Campaign",
                description: "Fossil fuel interests have launched a major campaign questioning the feasibility of rapid energy transition.",
                effects: {
                    publicApproval: -5
                },
                responses: [
                    {
                        id: "counter-campaign",
                        name: "Counter-Campaign",
                        description: "Launch a public information campaign highlighting clean energy benefits and feasibility.",
                        cost: 3,
                        effects: {
                            publicApproval: 5
                        }
                    },
                    {
                        id: "regulatory-response",
                        name: "Regulatory Response",
                        description: "Investigate industry claims and enforce transparency in lobbying activities.",
                        effects: {
                            publicApproval: -5,
                            budget: 5
                        }
                    },
                    {
                        id: "ignore",
                        name: "Ignore",
                        description: "Focus on implementation rather than public debate.",
                        effects: {
                            publicApproval: -5,
                            emissions: 3
                        }
                    }
                ]
            },
            {
                id: "election-change",
                name: "Election/Administration Change",
                description: "A recent election has shifted the political landscape, affecting climate policy support.",
                effects: {
                    publicApproval: -10
                },
                responses: [
                    {
                        id: "climate-framework",
                        name: "Climate Policy Framework Law",
                        description: "Establish legislation that enshrines climate goals beyond electoral cycles.",
                        cost: 8,
                        effects: {
                            publicApproval: 5,
                            emissions: -5
                        }
                    },
                    {
                        id: "cross-party",
                        name: "Cross-Party Climate Coalition",
                        description: "Build a broad coalition to ensure climate policy continuity despite political changes.",
                        cost: 5,
                        effects: {
                            publicApproval: 10
                        }
                    },
                    {
                        id: "adapt-reality",
                        name: "Adapt to New Reality",
                        description: "Adjust climate strategies to work within the new political context.",
                        cost: 3,
                        effects: {
                            emissions: 3,
                            publicApproval: 5
                        }
                    }
                ]
            },
            {
                id: "community-opposition",
                name: "Local Community Opposition",
                description: "Several communities are strongly opposing clean energy projects in their areas.",
                effects: {
                    publicApproval: -5,
                    gridStability: -5
                },
                responses: [
                    {
                        id: "community-benefits",
                        name: "Community Benefits Package",
                        description: "Develop comprehensive benefits packages for communities hosting projects.",
                        cost: 7,
                        effects: {
                            publicApproval: 10,
                            gridStability: 5
                        }
                    },
                    {
                        id: "alternative-siting",
                        name: "Alternative Siting Strategy",
                        description: "Relocate projects to areas with less opposition, despite lower resource quality.",
                        cost: 5,
                        effects: {
                            publicApproval: 5,
                            emissions: 3
                        }
                    },
                    {
                        id: "stakeholder-process",
                        name: "Enhanced Stakeholder Process",
                        description: "Implement a more inclusive planning process with greater community input.",
                        cost: 3,
                        effects: {
                            publicApproval: 5,
                            gridStability: 3
                        }
                    }
                ]
            }
        ]
    }
};

// Game State
let gameState = {
    selectedCountry: null,
    turn: 1,
    budget: 0,
    publicApproval: 0,
    gridStability: 0,
    emissions: 0,
    techLevels: {},
    selectedInvestments: [],
    selectedPolicies: [],
    eventHistory: [],
    availableBudget: 0
};

// Global DOM element references
let screens, startGameBtn, startWithCountryBtn, backToTitleBtn, confirmInvestmentsBtn,
    confirmPoliciesBtn, proceedToEventsBtn, eventContinueBtn, playAgainBtn,
    countrySelection, investmentsContainer, policiesContainer, currentYear,
    currentTurn, budgetValue, approvalValue, gridValue, emissionsValue,
    budgetBar, approvalBar, gridBar, emissionsBar, budgetAvailable,
    investmentsBudgetDisplay, eventContainer, notification, loadingOverlay;

// Initialize game
function init() {
    // Initialize DOM element references
    screens = {
        title: document.getElementById('title-screen'),
        country: document.getElementById('country-screen'),
        game: document.getElementById('game-screen'),
        events: document.getElementById('events-screen'),
        gameOver: document.getElementById('game-over-screen')
    };

    // Buttons
    startGameBtn = document.getElementById('start-game-btn');
    startWithCountryBtn = document.getElementById('start-with-country-btn');
    backToTitleBtn = document.getElementById('back-to-title-btn');
    confirmInvestmentsBtn = document.getElementById('confirm-investments-btn');
    confirmPoliciesBtn = document.getElementById('confirm-policies-btn');
    proceedToEventsBtn = document.getElementById('proceed-to-events-btn');
    eventContinueBtn = document.getElementById('event-continue-btn');
    playAgainBtn = document.getElementById('play-again-btn');

    // Game Display Elements
    countrySelection = document.getElementById('country-selection');
    investmentsContainer = document.getElementById('investments-container');
    policiesContainer = document.getElementById('policies-container');
    currentYear = document.getElementById('current-year');
    currentTurn = document.getElementById('current-turn');
    budgetValue = document.getElementById('budget-value');
    approvalValue = document.getElementById('approval-value');
    gridValue = document.getElementById('grid-value');
    emissionsValue = document.getElementById('emissions-value');
    budgetBar = document.getElementById('budget-bar');
    approvalBar = document.getElementById('approval-bar');
    gridBar = document.getElementById('grid-bar');
    emissionsBar = document.getElementById('emissions-bar');
    budgetAvailable = document.getElementById('budget-available');
    investmentsBudgetDisplay = document.getElementById('investments-budget-display');
    eventContainer = document.getElementById('event-container');
    notification = document.getElementById('notification');
    loadingOverlay = document.querySelector('.loading-overlay');

    loadCountrySelection();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    startGameBtn.addEventListener('click', () => {
        showScreen('country');
    });
    
    backToTitleBtn.addEventListener('click', () => {
        showScreen('title');
    });
    
    startWithCountryBtn.addEventListener('click', () => {
        if (gameState.selectedCountry) {
            initializeGameWithCountry(gameState.selectedCountry);
            showScreen('game');
        }
    });
    
    confirmInvestmentsBtn.addEventListener('click', () => {
        if (gameState.selectedInvestments.length > 0) {
            document.querySelector('.tab[data-tab="policies"]').click();
        } else {
            showNotification('Select at least one investment to continue');
        }
    });
    
    confirmPoliciesBtn.addEventListener('click', () => {
        document.querySelector('.tab[data-tab="summary"]').click();
        updateSummary();
    });
    
    proceedToEventsBtn.addEventListener('click', () => {
        processEndOfTurn();
        showScreen('events');
        generateRandomEvent();
    });
    
    eventContinueBtn.addEventListener('click', () => {
        if (gameState.turn < 5) {
            gameState.turn++;
            updateTurnDisplay();
            loadInvestmentOptions();
            loadPolicyOptions();
            
            // Reset selections for new turn
            gameState.selectedInvestments = [];
            gameState.selectedPolicies = [];
            
            // Reset tabs to investments
            document.querySelector('.tab[data-tab="investments"]').click();
            
            showScreen('game');
        } else {
            // Game over
            calculateFinalScore();
            showScreen('gameOver');
        }
    });
    
    playAgainBtn.addEventListener('click', () => {
        resetGame();
        showScreen('title');
    });
    
    // Tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activate clicked tab
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });
}

// Show screen and hide others
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    
    screens[screenName].classList.add('active');
}

// Load country selection
function loadCountrySelection() {
    countrySelection.innerHTML = '';
    
    gameData.countries.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.dataset.country = country.id;
        
        countryCard.innerHTML = `
            <div class="country-name">${country.name}</div>
            <div class="country-details">
                <p><strong>Starting Budget:</strong> $${country.startingBudget}B</p>
                <p><strong>Starting Approval:</strong> ${country.startingApproval}%</p>
                <p><strong>Grid Stability:</strong> ${country.startingGrid}%</p>
                <p><strong>Special Goal:</strong> ${country.specialVictory}</p>
            </div>
            <div class="country-description">${country.description}</div>
        `;
        
        countryCard.addEventListener('click', () => {
            document.querySelectorAll('.country-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            countryCard.classList.add('selected');
            gameState.selectedCountry = country.id;
            startWithCountryBtn.disabled = false;
            
            // Apply country theme
            document.body.className = '';
            document.body.classList.add(country.theme);
        });
        
        countrySelection.appendChild(countryCard);
    });
}

// Initialize game with selected country
function initializeGameWithCountry(countryId) {
    const country = gameData.countries.find(c => c.id === countryId);
    
    // Initialize game state
    gameState = {
        selectedCountry: countryId,
        turn: 1,
        budget: country.startingBudget,
        publicApproval: country.startingApproval,
        gridStability: country.startingGrid,
        emissions: country.startingEmissions,
        techLevels: { ...country.techLevels },
        selectedInvestments: [],
        selectedPolicies: [],
        eventHistory: [],
        availableBudget: country.startingBudget
    };
    
    // Update display
    updateResourceDisplay();
    updateTurnDisplay();
    
    // Load investment and policy options
    loadInvestmentOptions();
    loadPolicyOptions();
}

// Load investment options for the current turn
function loadInvestmentOptions() {
    const countryId = gameState.selectedCountry;
    const turn = gameState.turn;
    
    let investmentOptions = []; // Default to empty

    // Map country IDs to their respective global investment objects from investment_options.js
    // Assumes investment_options.js is loaded and these variables are global (e.g., window.chinaInvestments).
    const externalSourcesMap = {
        "china": "chinaInvestments",
        "india": "indiaInvestments",
        "germany": "germanyInvestments",
        "brazil": "brazilInvestments"
    };

    const externalObjectName = externalSourcesMap[countryId];

    if (externalObjectName && typeof window[externalObjectName] !== 'undefined') {
        const sourceObject = window[externalObjectName];
        // Data in investment_options.js uses keys like "turn1_additions"
        investmentOptions = sourceObject[`turn${turn}_additions`] || [];
        if (investmentOptions.length === 0) {
            console.warn(`No investments found in ${externalObjectName} for turn ${turn} (using 'turn${turn}_additions'). Source might be empty for this turn.`);
        }
    } else if (countryId === "usa") {
        // For USA, use the original gameData.investments structure.
        // Note: gameData.investments.usa.turnX are currently all empty arrays in script.js.
        if (gameData.investments[countryId] && gameData.investments[countryId][`turn${turn}`]) {
            investmentOptions = gameData.investments[countryId][`turn${turn}`];
        } else {
            console.warn(`Investment data structure in gameData.investments not found for ${countryId}, turn ${turn}.`);
            investmentOptions = []; // Ensure it's an array
        }
        // Add a specific warning if USA investments are being fetched and are empty.
        if (investmentOptions.length === 0) { // Check after potential assignment
             console.warn(`USA investments for turn ${turn} are empty or not found in gameData.investments.`);
        }
    } else {
        // This branch handles:
        // 1. Countries in externalSourcesMap (China, India, Germany, Brazil) but their corresponding global object (e.g., chinaInvestments) was not found.
        // 2. Theoretically, any other country not 'usa' and not in externalSourcesMap.
        if (externalObjectName) { // It was a known non-USA country, but its data source was missing
             console.warn(`External investment source '${externalObjectName}' for country ${countryId} was not found (e.g., investment_options.js might not be loaded or the object is not global). Defaulting to empty investments for turn ${turn}.`);
        } else { // Country is not USA and not in the map
             console.warn(`Country ${countryId} is not configured for standard investment loading (not 'usa' and not in externalSourcesMap). Defaulting to empty investments for turn ${turn}.`);
        }
        investmentOptions = [];
    }
    
    investmentsContainer.innerHTML = '';
    
    // Ensure investmentOptions is an array before calling forEach, in case of unexpected issues.
    if (!Array.isArray(investmentOptions)) {
        console.error(`Critical: investmentOptions resolved to a non-array for ${countryId}, turn ${turn}:`, investmentOptions, `Falling back to empty array.`);
        investmentOptions = [];
    }

    investmentOptions.forEach(investment => {
        const card = document.createElement('div');
        card.className = 'investment-card';
        card.dataset.id = investment.id;
        
        let effectsHtml = '';
        if (investment.effects) {
            effectsHtml = '<div class="investment-effects"><h4>Effects:</h4>';
            if (investment.effectDescription) {
                effectsHtml += `<div>${investment.effectDescription}</div>`;
            } else {
                for (const [key, value] of Object.entries(investment.effects)) {
                    if (typeof value === 'function') {
                        const midRangeValue = Math.floor((investment.minCost + investment.maxCost) / 2);
                        const effectValue = value(midRangeValue);
                        effectsHtml += `<div class="effect-item">
                            <span>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                            <span class="effect-value ${effectValue > 0 ? 'positive' : effectValue < 0 ? 'negative' : 'neutral'}">
                                ${effectValue > 0 ? '+' : ''}${effectValue}${key === 'budget' ? 'B' : '%'}
                            </span>
                        </div>`;
                    }
                }
            }
            effectsHtml += '</div>';
        }
        
        card.innerHTML = `
            <div class="investment-header">
                <div class="investment-title">${investment.name}</div>
                <div class="badge badge-${investment.risk.toLowerCase()}">${investment.risk} Risk</div>
            </div>
            <div class="investment-description">${investment.description}</div>
            <div class="investment-cost">
                <span>Cost: $<span class="cost-value">${investment.minCost}</span>B</span>
                <div class="slider-container">
                    <input type="range" min="${investment.minCost}" max="${investment.maxCost}" value="${investment.minCost}" step="1" class="investment-slider">
                </div>
                <span>$${investment.maxCost}B</span>
            </div>
            ${effectsHtml}
            <div class="investment-action">
                <div class="long-term"><strong>Long-term:</strong> ${investment.longTerm}</div>
                <button class="btn-small select-investment">Select</button>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.investment-slider').addEventListener('input', (e) => {
            card.querySelector('.cost-value').textContent = e.target.value;
        });
        
        card.querySelector('.select-investment').addEventListener('click', () => {
            const cost = parseInt(card.querySelector('.investment-slider').value);
            
            if (cost <= gameState.availableBudget || card.classList.contains('selected')) {
                if (card.classList.contains('selected')) {
                    // Deselect
                    card.classList.remove('selected');
                    const index = gameState.selectedInvestments.findIndex(i => i.id === investment.id);
                    if (index !== -1) {
                        gameState.availableBudget += gameState.selectedInvestments[index].cost;
                        gameState.selectedInvestments.splice(index, 1);
                    }
                } else {
                    // Select
                    card.classList.add('selected');
                    gameState.selectedInvestments.push({
                        ...investment,
                        cost: cost
                    });
                    gameState.availableBudget -= cost;
                }
                
                // Update budget display
                budgetAvailable.textContent = `Available: $${gameState.availableBudget}B`;
                investmentsBudgetDisplay.textContent = `$${gameState.availableBudget}B`;
            } else {
                showNotification('Not enough budget available');
            }
        });
        
        investmentsContainer.appendChild(card);
    });
    
    // Update budget display
    budgetAvailable.textContent = `Available: $${gameState.availableBudget}B`;
    investmentsBudgetDisplay.textContent = `$${gameState.availableBudget}B`;
}

// Load policy options for the current turn
function loadPolicyOptions() {
    const countryId = gameState.selectedCountry;
    const turn = gameState.turn;
    
    const policyOptions = gameData.policies[countryId][`turn${turn}`];
    
    policiesContainer.innerHTML = '';
    
    policyOptions.forEach(policy => {
        const card = document.createElement('div');
        card.className = 'investment-card';
        card.dataset.id = policy.id;
        
        let effectsHtml = '<div class="investment-effects"><h4>Effects:</h4>';
        for (const [key, value] of Object.entries(policy.effects)) {
            effectsHtml += `<div class="effect-item">
                <span>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                <span class="effect-value ${value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'}">
                    ${value > 0 ? '+' : ''}${value}${key === 'budget' ? 'B' : '%'}
                </span>
            </div>`;
        }
        effectsHtml += '</div>';
        
        card.innerHTML = `
            <div class="investment-header">
                <div class="investment-title">${policy.name}</div>
                <div class="badge badge-${policy.risk.toLowerCase()}">${policy.risk} Risk</div>
            </div>
            <div class="investment-description">${policy.description}</div>
            ${policy.cost ? `<div><strong>Cost:</strong> $${policy.cost}B</div>` : ''}
            ${effectsHtml}
            <div class="investment-action">
                <button class="btn-small select-policy">Select</button>
            </div>
        `;
        
        card.querySelector('.select-policy').addEventListener('click', () => {
            if (policy.cost && policy.cost > gameState.availableBudget && !card.classList.contains('selected')) {
                showNotification('Not enough budget available');
                return;
            }
            
            if (card.classList.contains('selected')) {
                // Deselect
                card.classList.remove('selected');
                const index = gameState.selectedPolicies.findIndex(p => p.id === policy.id);
                if (index !== -1) {
                    if (policy.cost) {
                        gameState.availableBudget += policy.cost;
                    }
                    gameState.selectedPolicies.splice(index, 1);
                }
            } else {
                // Select
                if (gameState.selectedPolicies.length < 2) {
                    card.classList.add('selected');
                    gameState.selectedPolicies.push(policy);
                    if (policy.cost) {
                        gameState.availableBudget -= policy.cost;
                    }
                } else {
                    showNotification('You can select a maximum of 2 policies');
                }
            }
            
            // Update budget display
            budgetAvailable.textContent = `Available: $${gameState.availableBudget}B`;
            investmentsBudgetDisplay.textContent = `$${gameState.availableBudget}B`;
        });
        
        policiesContainer.appendChild(card);
    });
}

// Update the turn display
function updateTurnDisplay() {
    const years = {
        1: "2025-2030",
        2: "2030-2035",
        3: "2035-2040",
        4: "2040-2045",
        5: "2045-2050"
    };
    
    currentYear.textContent = years[gameState.turn];
    currentTurn.textContent = gameState.turn;
    
    // Update progress track
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
        
        const stepNum = parseInt(step.dataset.step);
        if (stepNum === gameState.turn) {
            step.classList.add('active');
        } else if (stepNum < gameState.turn) {
            step.classList.add('completed');
        }
    });
}

// Update resource display
function updateResourceDisplay() {
    budgetValue.textContent = `$${gameState.budget}B`;
    approvalValue.textContent = `${gameState.publicApproval}%`;
    gridValue.textContent = `${gameState.gridStability}%`;
    emissionsValue.textContent = `${gameState.emissions}%`;
    
    budgetBar.style.width = `${(gameState.budget / 200) * 100}%`;
    approvalBar.style.width = `${gameState.publicApproval}%`;
    gridBar.style.width = `${gameState.gridStability}%`;
    emissionsBar.style.width = `${gameState.emissions}%`;
    
    budgetAvailable.textContent = `Available: $${gameState.availableBudget}B`;
    investmentsBudgetDisplay.textContent = `$${gameState.availableBudget}B`;
}

// Update the turn summary
function updateSummary() {
    document.getElementById('summary-budget').textContent = `$${gameState.budget}B`;
    document.getElementById('summary-approval').textContent = `${gameState.publicApproval}%`;
    document.getElementById('summary-grid').textContent = `${gameState.gridStability}%`;
    document.getElementById('summary-emissions').textContent = `${gameState.emissions}%`;
    
    const investmentsDiv = document.getElementById('summary-investments');
    investmentsDiv.innerHTML = '';
    
    if (gameState.selectedInvestments.length === 0) {
        investmentsDiv.innerHTML = '<p>No investments selected</p>';
    } else {
        gameState.selectedInvestments.forEach(investment => {
            const div = document.createElement('div');
            div.className = 'summary-row';
            div.innerHTML = `
                <div>${investment.name}</div>
                <div>$${investment.cost}B</div>
            `;
            investmentsDiv.appendChild(div);
        });
    }
    
    const policiesDiv = document.getElementById('summary-policies');
    policiesDiv.innerHTML = '';
    
    if (gameState.selectedPolicies.length === 0) {
        policiesDiv.innerHTML = '<p>No policies selected</p>';
    } else {
        gameState.selectedPolicies.forEach(policy => {
            const div = document.createElement('div');
            div.className = 'summary-row';
            div.innerHTML = `
                <div>${policy.name}</div>
                <div>${policy.cost ? `$${policy.cost}B` : 'No direct cost'}</div>
            `;
            policiesDiv.appendChild(div);
        });
    }
}

// Process end of turn
function processEndOfTurn() {
    showLoading();
    
    setTimeout(() => {
        // Apply effects from investments
        gameState.selectedInvestments.forEach(investment => {
            gameState.budget -= investment.cost; // Deduct actual cost from main budget
            if (investment.effects) {
                for (const [key, value] of Object.entries(investment.effects)) {
                    if (typeof value === 'function') {
                        const effectValue = value(investment.cost);
                        applyEffect(key, effectValue);
                    } else {
                        applyEffect(key, value);
                    }
                }
            }
        });

        // Apply effects from policies
        gameState.selectedPolicies.forEach(policy => {
            if (policy.cost) {
                gameState.budget -= policy.cost; // Deduct actual cost from main budget
            }
            if (policy.effects) {
                for (const [key, value] of Object.entries(policy.effects)) {
                    applyEffect(key, value);
                }
            }
        });

        // Convert leftover budget to public support
        if (gameState.availableBudget > 0) {
            const conversionRate = 0.1 + Math.random() * 0.2; // Random rate between 0.1 and 0.3
            const approvalBonus = Math.floor(gameState.availableBudget * conversionRate);
            if (approvalBonus > 0) {
                applyEffect('publicApproval', approvalBonus);
                showNotification(`Gained +${approvalBonus}% public approval from unspent budget!`);
                console.log(`Converted $${gameState.availableBudget}B to +${approvalBonus}% public approval.`);
            }
            gameState.availableBudget = 0; // Reset leftover budget as it's been converted
        }

        // Economic growth factor (simple version)
        const growthFactor = 1.05 + (Math.random() * 0.1); // 5-15% growth per turn
        gameState.budget = Math.round(gameState.budget * growthFactor);
        
        // Update display
        updateResourceDisplay();
        
        hideLoading();
    }, 1000);  // Simulated processing time
}

// Apply an effect to the game state
function applyEffect(key, value) {
    switch (key) {
        case 'budget':
            gameState.budget += value;
            gameState.availableBudget += value;
            break;
        case 'publicApproval':
            gameState.publicApproval = Math.max(0, Math.min(100, gameState.publicApproval + value));
            break;
        case 'gridStability':
            gameState.gridStability = Math.max(0, Math.min(100, gameState.gridStability + value));
            break;
        case 'emissions':
            gameState.emissions = Math.max(0, gameState.emissions + value);
            break;
        default:
            // For tech levels
            if (key.startsWith('tech')) {
                const techKey = key.replace('tech', '').toLowerCase();
                if (gameState.techLevels[techKey]) {
                    gameState.techLevels[techKey] = Math.min(100, gameState.techLevels[techKey] + value);
                }
            }
    }
}

// Generate a random event
function generateRandomEvent() {
    console.log("Attempting to generate random event. Current turn:", gameState.turn);
    const countryId = gameState.selectedCountry.id;
    const countryEvents = gameData.events[countryId] || [];
    const globalEvents = gameData.events.global || [];
    
    let availableEvents = [...countryEvents, ...globalEvents].filter(event => 
        (!event.minTurn || gameState.turn >= event.minTurn) &&
        (!event.maxTurn || gameState.turn <= event.maxTurn) &&
        !gameState.seenEvents.includes(event.id) // Filter out seen events
    );

    console.log("Available events for this turn:", availableEvents.length, availableEvents.map(e => e.id));

    if (availableEvents.length === 0) {
        console.log("No available events for this turn or all unique events shown.");
        // Optionally, show a generic message or skip event
        document.getElementById('eventScreen').style.display = 'none'; 
        return;
    }

    // Weighted random selection (optional, can be simplified to Math.random)
    const totalWeight = availableEvents.reduce((sum, event) => sum + (event.weight || 1), 0);
    let randomRoll = Math.random() * totalWeight;
    let selectedEvent = null;

    for (const event of availableEvents) {
        randomRoll -= (event.weight || 1);
        if (randomRoll <= 0) {
            selectedEvent = event;
            break;
        }
    }

    if (selectedEvent) {
        console.log("Selected event:", selectedEvent.id, selectedEvent.name);
        gameState.events.push({ turn: gameState.turn, event: selectedEvent });
        gameState.seenEvents.push(selectedEvent.id); // Add to seen events

        document.getElementById('eventTitle').textContent = selectedEvent.name;
        document.getElementById('eventDescription').textContent = selectedEvent.description;
        
        const responseOptionsContainer = document.getElementById('responseOptions');
        responseOptionsContainer.innerHTML = ''; // Clear previous options

        selectedEvent.responses.forEach(response => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('response-option');
            optionElement.innerHTML = `
                <div class="response-title">${response.text}</div>
                <div class="response-effects">${formatEffects(response.effects)}</div>
            `;
            optionElement.onclick = () => handleEventResponse(response, selectedEvent);
            responseOptionsContainer.appendChild(optionElement);
        });
        
        showScreen('eventScreen');
    } else {
        console.log("No event selected this turn despite available options. This might indicate an issue with weighting or selection logic.");
        document.getElementById('eventScreen').style.display = 'none';
    }
}

// Calculate final score
function calculateFinalScore() {
    // Emissions reduction score (40%)
    const emissionsReduction = 100 - gameState.emissions;
    const emissionsScore = emissionsReduction * 0.4;
    
    // Economic health score (20%)
    const economicScore = (gameState.budget / 200) * 20;
    
    // Public approval score (20%)
    const approvalScore = gameState.publicApproval * 0.2;
    
    // Grid stability score (20%)
    const gridScore = gameState.gridStability * 0.2;
    
    // Total score
    const totalScore = emissionsScore + economicScore + approvalScore + gridScore;
    
    // Determine victory category
    let victoryCategory;
    if (totalScore >= 80) {
        victoryCategory = "Climate Champion";
    } else if (totalScore >= 60) {
        victoryCategory = "Successful Transition";
    } else if (totalScore >= 40) {
        victoryCategory = "Mixed Results";
    } else {
        victoryCategory = "Transition Failure";
    }
    
    // Update game over screen
    document.getElementById('victory-category').innerHTML = `<h2>${victoryCategory}</h2>`;
    document.getElementById('result-summary').textContent = getResultSummary(victoryCategory);
    
    document.getElementById('final-emissions').textContent = `${emissionsReduction}% reduction (${Math.round(emissionsScore)} points)`;
    document.getElementById('final-economy').textContent = `$${gameState.budget}B budget (${Math.round(economicScore)} points)`;
    document.getElementById('final-approval').textContent = `${gameState.publicApproval}% approval (${Math.round(approvalScore)} points)`;
    document.getElementById('final-grid').textContent = `${gameState.gridStability}% stability (${Math.round(gridScore)} points)`;
    
    const country = gameData.countries.find(c => c.id === gameState.selectedCountry);
    document.getElementById('final-special').textContent = evaluateSpecialGoal(country);
    
    document.getElementById('final-score').textContent = `${Math.round(totalScore)} / 100`;
}

// Get result summary based on victory category
function getResultSummary(category) {
    const country = gameData.countries.find(c => c.id === gameState.selectedCountry);
    
    switch (category) {
        case "Climate Champion":
            return `Under your leadership, ${country.name} has achieved an exceptional energy transition, meeting climate goals while maintaining a strong economy and public support. Your nation stands as a global model for clean energy transformation.`;
        case "Successful Transition":
            return `You've successfully guided ${country.name} through a challenging energy transition, balancing climate goals with economic and social priorities. While not perfect, your achievements have put the nation on a sustainable path.`;
        case "Mixed Results":
            return `Your efforts to transition ${country.name} to clean energy have yielded mixed results. While progress has been made in some areas, significant challenges remain, and the path to full decarbonization is uncertain.`;
        case "Transition Failure":
            return `The energy transition in ${country.name} has fallen short of its goals under your leadership. Climate targets have been missed, and the economic and social costs have been high. Future generations will face significant challenges.`;
        default:
            return "The results of your leadership remain to be seen.";
    }
}

// Evaluate special goal achievement
function evaluateSpecialGoal(country) {
    switch (country.id) {
        case "usa":
            // Technological Dominance
            const highTechCount = Object.values(gameState.techLevels).filter(level => level >= 80).length;
            return highTechCount >= 3 ? 
                "Achieved! Global technology leadership in multiple clean energy sectors." : 
                "Not achieved. Insufficient technological leadership.";
        
        case "china":
            // Clean Manufacturing Dominance
            return gameState.budget >= 250 ? 
                "Achieved! Dominant position in global clean technology exports." : 
                "Not achieved. Insufficient manufacturing export position.";
        
        case "india":
            // Leapfrog Development
            return gameState.emissions <= 50 && gameState.publicApproval >= 70 ? 
                "Achieved! Provided clean energy access while reducing emissions." : 
                "Not achieved. Failed to balance development and climate goals.";
        
        case "germany":
            // Energy Independence
            return gameState.emissions <= 40 && gameState.gridStability >= 80 ? 
                "Achieved! Eliminated fossil fuel imports while maintaining industrial strength." : 
                "Not achieved. Failed to achieve energy independence.";
        
        case "brazil":
            // Green Economic Powerhouse
            return gameState.emissions <= 30 && gameState.budget >= 150 ? 
                "Achieved! Preserved Amazon forest while growing a clean energy economy." : 
                "Not achieved. Failed to balance forest preservation with economic growth.";
        
        default:
            return "Special goal evaluation unavailable.";
    }
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show loading overlay
function showLoading() {
    loadingOverlay.classList.add('active');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Reset game
function resetGame() {
    gameState = {
        selectedCountry: null,
        turn: 1,
        budget: 0,
        publicApproval: 0,
        gridStability: 0,
        emissions: 0,
        techLevels: {},
        selectedInvestments: [],
        selectedPolicies: [],
        eventHistory: [],
        availableBudget: 0
    };
    
    document.body.className = '';
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', init);