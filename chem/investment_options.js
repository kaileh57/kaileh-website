// Additional investment options for non-US countries based on the game design document

// CHINA additional options
const chinaInvestments = {
    // Turn 1 additional options
    turn1_additions: [
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
    
    // Turn 2 additional options
    turn2_additions: [
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
    
    // Turn 3 additional options
    turn3_additions: [
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
    
    // Turn 4 additional options
    turn4_additions: [
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
        },
        {
            id: "china_climate_resilient_infrastructure_t4",
            name: "Climate-Resilient Infrastructure",
            description: "Upgrade and protect energy infrastructure against extreme weather and climate impacts.",
            minCost: 40,
            maxCost: 90,
            risk: "Low",
            longTerm: "Ensures system stability despite increasing climate impacts.",
            effects: {
                gridStability: cost => Math.floor(cost / 4) + 5,
                publicApproval: cost => Math.floor(cost / 10) + 5 // Visible safety improvements
            }
        }
    ],
    
    // Turn 5 additional options
    turn5_additions: [
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
};

// INDIA additional options
const indiaInvestments = {
    // Turn 1 additional options
    turn1_additions: [
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
                emissions: cost => -Math.floor(cost / 10) // Small direct effect
            }
        }
    ],
    
    // Turn 2 additional options
    turn2_additions: [
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
            id: "india_pumped_hydro_t2",
            name: "Pumped Hydro Storage Program",
            description: "Develop pumped hydroelectric storage for grid balancing.",
            minCost: 8,
            maxCost: 20,
            risk: "Medium",
            longTerm: "Provides large-scale energy storage and grid stability.",
            effects: {
                gridStability: cost => Math.floor(cost / 4) + 5,
                emissions: cost => -Math.floor(cost / 8) // Enables more renewables
            }
        },
        {
            id: "india_smart_cities_energy_t2",
            name: "Smart Cities Energy Integration",
            description: "Implement integrated energy solutions in urban development.",
            minCost: 5,
            maxCost: 15,
            risk: "Low",
            longTerm: "Creates models for efficient urban energy systems.",
            effects: {
                emissions: cost => -Math.floor(cost / 7),
                gridStability: cost => Math.floor(cost / 10),
                techGrid: cost => Math.floor(cost / 8)
            }
        }
    ],
    
    // Turn 3-5 additional options would continue in the same format...
};

// GERMANY additional options
const germanyInvestments = {
    // Turn 1 additional options
    turn1_additions: [
        {
            id: "germany_north_sea_wind_t1",
            name: "North Sea Wind Expansion",
            description: "Expand offshore wind capacity in the North Sea.",
            minCost: 15,
            maxCost: 35,
            risk: "Medium",
            longTerm: "Provides large-scale renewable energy from reliable wind resource.",
            effects: {
                emissions: cost => -Math.floor(cost / 3),
                techWind: cost => Math.floor(cost / 5)
            }
        },
        {
            id: "germany_residential_efficiency_t1",
            name: "Residential Energy Efficiency Program",
            description: "Fund large-scale home insulation and heating system upgrades.",
            minCost: 8,
            maxCost: 20,
            risk: "Low",
            longTerm: "Reduces energy demand and emissions from buildings.",
            effects: {
                emissions: cost => -Math.floor(cost / 4),
                publicApproval: cost => Math.floor(cost / 8)
            }
        },
        {
            id: "germany_transmission_expansion_t1",
            name: "Transmission System Expansion",
            description: "Build north-south transmission lines to connect offshore wind to southern demand.",
            minCost: 10,
            maxCost: 25,
            risk: "Medium",
            longTerm: "Essential for balancing regional renewable generation with demand centers.",
            effects: {
                gridStability: cost => Math.floor(cost / 3),
                techGrid: cost => Math.floor(cost / 7)
            }
        }
    ],
    
    // Additional turns would follow the same format...
};

// BRAZIL additional options
const brazilInvestments = {
    // Turn 1 additional options
    turn1_additions: [
        {
            id: "brazil_amazon_monitoring_t1",
            name: "Amazon Monitoring System",
            description: "Deploy advanced satellite and ground monitoring to prevent deforestation.",
            minCost: 3,
            maxCost: 8,
            risk: "Medium",
            longTerm: "Prevents emissions from land use change, the largest source in Brazil.",
            effects: {
                emissions: cost => -Math.floor(cost / 1), // Very high impact per dollar
                publicApproval: cost => Math.floor(cost / 10) - 5 // Mixed reception
            }
        },
        {
            id: "brazil_northeast_solar_t1",
            name: "Northeast Solar Initiative",
            description: "Develop large-scale solar in the sunny, less-developed Northeast region.",
            minCost: 10,
            maxCost: 25,
            risk: "Low",
            longTerm: "Creates renewable capacity in region with highest solar potential.",
            effects: {
                emissions: cost => -Math.floor(cost / 5),
                publicApproval: cost => Math.floor(cost / 5) + 5, // Regional development
                techSolar: cost => Math.floor(cost / 8)
            }
        },
        {
            id: "brazil_transmission_expansion_t1",
            name: "National Grid Integration",
            description: "Expand transmission to connect remote renewable resources to demand centers.",
            minCost: 8,
            maxCost: 20,
            risk: "Medium",
            longTerm: "Enables development of renewable resources in optimal locations.",
            effects: {
                gridStability: cost => Math.floor(cost / 3),
                techGrid: cost => Math.floor(cost / 6)
            }
        },
        {
            id: "brazil_bioenergy_expansion_t1",
            name: "Sustainable Bioenergy Scale-Up",
            description: "Expand production of biofuels and biomass energy using sustainable feedstocks.",
            minCost: 7,
            maxCost: 18,
            risk: "Low",
            longTerm: "Leverages Brazil's agricultural expertise for clean energy.",
            effects: {
                emissions: cost => -Math.floor(cost / 4),
                budget: cost => Math.floor(cost / 10) // Export potential
            }
        }
    ],
    
    // Additional turns would follow the same format...
};

// This file provides a reference of investment options that can be added to each country
// Copy the relevant sections into the main game script as needed 