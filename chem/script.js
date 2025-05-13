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
            "turn1": [
                {
                    id: "solar-expansion",
                    name: "Solar Energy Expansion",
                    description: "Invest in utility-scale and distributed solar energy installations across high-potential regions.",
                    minCost: 5,
                    maxCost: 25,
                    risk: "Low",
                    longTerm: "Increases solar capacity and reduces emissions",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        techSolar: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "wind-program",
                    name: "Wind Power Program",
                    description: "Fund the development of onshore and offshore wind projects with focus on high-capacity regions.",
                    minCost: 5,
                    maxCost: 25,
                    risk: "Low",
                    longTerm: "Increases wind capacity and reduces emissions",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        techWind: (cost) => Math.floor(cost * 0.2),
                        gridStability: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "battery-storage",
                    name: "Grid-Scale Battery Storage",
                    description: "Develop large-scale battery storage projects to support renewable integration and grid stability.",
                    minCost: 10,
                    maxCost: 30,
                    risk: "Medium",
                    longTerm: "Improves grid stability and enables higher renewable penetration",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techStorage: (cost) => Math.floor(cost * 0.3)
                    }
                },
                {
                    id: "nuclear-modernize",
                    name: "Nuclear Plant Modernization",
                    description: "Upgrade existing nuclear plants for extended operation with improved safety and efficiency.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Extends clean baseload power capacity and improves safety",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.3),
                        emissions: (cost) => -Math.floor(cost * 0.2),
                        techNuclear: (cost) => Math.floor(cost * 0.15)
                    }
                },
                {
                    id: "grid-modernize",
                    name: "Grid Modernization Initiative",
                    description: "Update transmission and distribution infrastructure with smart grid capabilities.",
                    minCost: 10,
                    maxCost: 40,
                    risk: "Medium",
                    longTerm: "Enables higher renewable integration and improves resilience",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.5),
                        techGrid: (cost) => Math.floor(cost * 0.25)
                    }
                }
            ],
            "turn2": [], "turn3": [], "turn4": [], "turn5": []
        },
        "china": {
            "turn1": [
                {
                    id: "solar-manufacturing",
                    name: "Solar Manufacturing Expansion",
                    description: "Expand production capacity for solar panels to achieve global scale advantages.",
                    minCost: 10,
                    maxCost: 30,
                    risk: "Low",
                    longTerm: "Dominates global solar manufacturing and reduces costs",
                    effects: {
                        techSolar: (cost) => Math.floor(cost * 0.3),
                        budget: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "wind-turbine",
                    name: "Wind Turbine Manufacturing",
                    description: "Develop domestic production capabilities for advanced wind turbines.",
                    minCost: 8,
                    maxCost: 25,
                    risk: "Low",
                    longTerm: "Creates export industry for wind technologies",
                    effects: {
                        techWind: (cost) => Math.floor(cost * 0.3),
                        budget: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "battery-production",
                    name: "Battery Gigafactory Program",
                    description: "Build multiple large-scale battery production facilities using standardized designs.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Secures battery supply chain and reduces costs",
                    effects: {
                        techStorage: (cost) => Math.floor(cost * 0.3),
                        budget: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "nuclear-expansion",
                    name: "Nuclear Fleet Expansion",
                    description: "Accelerate construction of planned nuclear plants with standardized designs.",
                    minCost: 20,
                    maxCost: 50,
                    risk: "Medium",
                    longTerm: "Provides reliable clean baseload power",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        gridStability: (cost) => Math.floor(cost * 0.3),
                        techNuclear: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "ultra-high-voltage",
                    name: "Ultra-High Voltage Transmission",
                    description: "Expand UHV grid connecting resource-rich western regions with eastern demand centers.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Medium",
                    longTerm: "Enables efficient long-distance energy transmission",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techGrid: (cost) => Math.floor(cost * 0.3)
                    }
                }
            ],
            "turn2": [], "turn3": [], "turn4": [], "turn5": []
        },
        "india": {
            "turn1": [
                {
                    id: "solar-village",
                    name: "Solar Village Program",
                    description: "Deploy solar microgrids to electrify rural villages with renewable energy.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Low",
                    longTerm: "Provides clean energy access to rural populations",
                    effects: {
                        publicApproval: (cost) => Math.floor(cost * 0.7),
                        emissions: (cost) => -Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "solar-parks",
                    name: "Utility-Scale Solar Parks",
                    description: "Develop large solar parks in high-insolation regions with simplified land acquisition.",
                    minCost: 8,
                    maxCost: 20,
                    risk: "Low",
                    longTerm: "Creates large-scale affordable renewable capacity",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        techSolar: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "wind-coastal",
                    name: "Coastal Wind Corridor",
                    description: "Develop wind energy corridors in high-potential coastal regions.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Low",
                    longTerm: "Establishes reliable renewable energy source",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        techWind: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "hydro-pumped",
                    name: "Pumped Hydro Storage",
                    description: "Develop pumped hydro storage facilities to balance renewable generation.",
                    minCost: 7,
                    maxCost: 18,
                    risk: "Medium",
                    longTerm: "Provides grid stabilization for renewable integration",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.5),
                        techStorage: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "green-corridor",
                    name: "Green Energy Corridor",
                    description: "Build transmission infrastructure dedicated to evacuating renewable energy.",
                    minCost: 6,
                    maxCost: 18,
                    risk: "Medium",
                    longTerm: "Enhances grid capacity for renewable energy",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techGrid: (cost) => Math.floor(cost * 0.2)
                    }
                }
            ],
            "turn2": [
                {
                    id: "solar-manufacturing",
                    name: "Solar Manufacturing Program",
                    description: "Develop domestic manufacturing capabilities for solar equipment.",
                    minCost: 8,
                    maxCost: 20,
                    risk: "Medium",
                    longTerm: "Creates domestic supply chain and reduces import dependency",
                    effects: {
                        techSolar: (cost) => Math.floor(cost * 0.3),
                        budget: (cost) => Math.floor(cost * 0.1),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "rooftop-solar",
                    name: "Rooftop Solar Initiative",
                    description: "Accelerate deployment of rooftop solar systems across urban areas.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Low",
                    longTerm: "Distributes generation capacity and reduces transmission needs",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "battery-manufacturing",
                    name: "Battery Manufacturing Initiative",
                    description: "Develop domestic battery production capabilities.",
                    minCost: 8,
                    maxCost: 22,
                    risk: "Medium",
                    longTerm: "Creates critical component for clean energy transition",
                    effects: {
                        techStorage: (cost) => Math.floor(cost * 0.3),
                        budget: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "small-hydro",
                    name: "Small Hydropower Program",
                    description: "Develop small, environmentally-friendly hydropower projects across river systems.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Medium",
                    longTerm: "Provides reliable renewable generation with storage capacity",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.2),
                        gridStability: (cost) => Math.floor(cost * 0.3)
                    }
                },
                {
                    id: "smart-grid-initiative",
                    name: "Smart Grid Technology Initiative",
                    description: "Implement digital grid management technologies in major urban centers.",
                    minCost: 6,
                    maxCost: 18,
                    risk: "Medium",
                    longTerm: "Improves grid efficiency and reliability",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techGrid: (cost) => Math.floor(cost * 0.3)
                    }
                }
            ],
            "turn3": [], "turn4": [], "turn5": []
        },
        "germany": {
            "turn1": [
                {
                    id: "offshore-wind",
                    name: "North Sea Wind Expansion",
                    description: "Accelerate development of offshore wind farms in the North Sea.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Creates reliable, high-capacity renewable energy source",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        techWind: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "solar-acceleration",
                    name: "Solar Deployment Acceleration",
                    description: "Streamline permitting and increase incentives for solar PV deployment.",
                    minCost: 10,
                    maxCost: 25,
                    risk: "Low",
                    longTerm: "Distributes renewable capacity across the country",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        techSolar: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "grid-expansion",
                    name: "North-South Grid Expansion",
                    description: "Accelerate construction of transmission lines connecting northern wind to southern demand.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "High",
                    longTerm: "Reduces curtailment and enables higher renewable penetration",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.5),
                        techGrid: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "industrial-efficiency",
                    name: "Industrial Energy Efficiency",
                    description: "Fund implementation of energy efficiency technologies in industrial processes.",
                    minCost: 8,
                    maxCost: 20,
                    risk: "Low",
                    longTerm: "Reduces industrial energy demand",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.2),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "battery-storage",
                    name: "Battery Storage Deployment",
                    description: "Deploy grid-scale battery storage systems to support renewable integration.",
                    minCost: 12,
                    maxCost: 30,
                    risk: "Medium",
                    longTerm: "Provides short-duration balancing for variable renewables",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techStorage: (cost) => Math.floor(cost * 0.2)
                    }
                }
            ],
            "turn2": [
                {
                    id: "floating-wind",
                    name: "Floating Wind Technology",
                    description: "Develop and deploy floating wind turbine technology for deeper waters.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "High",
                    longTerm: "Enables offshore wind in deeper Baltic Sea regions",
                    effects: {
                        techWind: (cost) => Math.floor(cost * 0.3),
                        emissions: (cost) => -Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "building-retrofit",
                    name: "National Building Retrofit Program",
                    description: "Implement comprehensive energy efficiency retrofits for existing buildings.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "Medium",
                    longTerm: "Significantly reduces energy demand from building sector",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "hydrogen-pilot",
                    name: "Green Hydrogen Pilot Program",
                    description: "Develop electrolysis facilities powered by renewable energy for industrial applications.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "High",
                    longTerm: "Creates pathway for decarbonizing heavy industry",
                    effects: {
                        techStorage: (cost) => Math.floor(cost * 0.2),
                        emissions: (cost) => -Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "heat-pumps",
                    name: "Heat Pump Transformation",
                    description: "Accelerate deployment of electric heat pumps for space heating across residential and commercial sectors.",
                    minCost: 12,
                    maxCost: 30,
                    risk: "Medium",
                    longTerm: "Electrifies heating sector and reduces gas dependence",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        publicApproval: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "smart-grid",
                    name: "Smart Grid Initiative",
                    description: "Implement digital grid management technologies to optimize system operation.",
                    minCost: 10,
                    maxCost: 25,
                    risk: "Medium",
                    longTerm: "Improves grid flexibility and enables higher renewable share",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techGrid: (cost) => Math.floor(cost * 0.3)
                    }
                }
            ],
            "turn3": [
                {
                    id: "offshore-capacity",
                    name: "Massive Offshore Wind Capacity",
                    description: "Rapidly scale up offshore wind farms in North and Baltic Seas.",
                    minCost: 25,
                    maxCost: 50,
                    risk: "Medium",
                    longTerm: "Establishes wind as primary electricity source",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.5),
                        techWind: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "industrial-hydrogen",
                    name: "Industrial Hydrogen Transformation",
                    description: "Scale up green hydrogen production for steel, chemicals, and other industries.",
                    minCost: 20,
                    maxCost: 45,
                    risk: "High",
                    longTerm: "Decarbonizes hard-to-abate industrial sectors",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        techStorage: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "power-to-x",
                    name: "Power-to-X Demonstration",
                    description: "Develop facilities to convert renewable electricity to synthetic fuels and chemicals.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "High",
                    longTerm: "Creates pathway for aviation, shipping, and chemical feedstocks",
                    effects: {
                        techStorage: (cost) => Math.floor(cost * 0.3),
                        emissions: (cost) => -Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "eu-supergrid",
                    name: "European Supergrid Connections",
                    description: "Enhance cross-border transmission capacity with neighboring countries.",
                    minCost: 20,
                    maxCost: 45,
                    risk: "Medium",
                    longTerm: "Enables electricity trading and balancing across Europe",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.5),
                        techGrid: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "seasonal-storage",
                    name: "Seasonal Energy Storage Program",
                    description: "Develop large-scale storage solutions for inter-seasonal energy balancing.",
                    minCost: 15,
                    maxCost: 40,
                    risk: "High",
                    longTerm: "Enables very high renewable penetration despite seasonal variations",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techStorage: (cost) => Math.floor(cost * 0.3)
                    }
                }
            ],
            "turn4": [
                {
                    id: "wind-leadership",
                    name: "Global Wind Technology Leadership",
                    description: "Establish position as leading developer and exporter of advanced wind energy technology.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Creates export industry and technology advantage",
                    effects: {
                        techWind: (cost) => Math.floor(cost * 0.3),
                        budget: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "hydrogen-infrastructure",
                    name: "Hydrogen Infrastructure Network",
                    description: "Build comprehensive hydrogen production, storage, and distribution infrastructure.",
                    minCost: 25,
                    maxCost: 55,
                    risk: "High",
                    longTerm: "Creates foundation for hydrogen economy",
                    effects: {
                        techStorage: (cost) => Math.floor(cost * 0.3),
                        emissions: (cost) => -Math.floor(cost * 0.3)
                    }
                },
                {
                    id: "industrial-transformation",
                    name: "Zero-Carbon Industry Transformation",
                    description: "Transform traditional industrial centers to zero-carbon production processes.",
                    minCost: 30,
                    maxCost: 60,
                    risk: "Very High",
                    longTerm: "Maintains industrial strength while eliminating emissions",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        budget: (cost) => -Math.floor(cost * 0.1),
                        publicApproval: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "energy-positive",
                    name: "Energy-Positive Buildings",
                    description: "Deploy buildings that generate more energy than they consume.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Transforms buildings from consumers to producers of energy",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.2),
                        techSolar: (cost) => Math.floor(cost * 0.2),
                        publicApproval: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "digital-energy",
                    name: "Digital Energy Infrastructure",
                    description: "Deploy AI-driven energy management systems with comprehensive data integration.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Medium",
                    longTerm: "Creates world's most efficient energy system operation",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.5),
                        techGrid: (cost) => Math.floor(cost * 0.3)
                    }
                }
            ],
            "turn5": [
                {
                    id: "renewable-export",
                    name: "Renewable Energy Export Hub",
                    description: "Develop capacity to export renewable energy to neighboring countries.",
                    minCost: 25,
                    maxCost: 50,
                    risk: "Medium",
                    longTerm: "Transforms into net energy exporter",
                    effects: {
                        budget: (cost) => Math.floor(cost * 0.3),
                        emissions: (cost) => -Math.floor(cost * 0.3)
                    }
                },
                {
                    id: "clean-manufacturing",
                    name: "Clean Manufacturing Leadership",
                    description: "Establish global leadership in clean manufacturing processes and technology.",
                    minCost: 20,
                    maxCost: 45,
                    risk: "High",
                    longTerm: "Creates export advantage in clean industrial technology",
                    effects: {
                        budget: (cost) => Math.floor(cost * 0.3),
                        emissions: (cost) => -Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "circular-economy",
                    name: "Circular Economy Implementation",
                    description: "Transform economy to circularity principles with full resource cycling.",
                    minCost: 20,
                    maxCost: 40,
                    risk: "Medium",
                    longTerm: "Minimizes resource extraction and waste",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "fusion-contribution",
                    name: "International Fusion Project",
                    description: "Contribute to international fusion energy research and development.",
                    minCost: 15,
                    maxCost: 35,
                    risk: "Very High",
                    longTerm: "Positions for future fusion energy leadership",
                    effects: {
                        techNuclear: (cost) => Math.floor(cost * 0.4)
                    }
                },
                {
                    id: "energy-autonomy",
                    name: "Complete Energy Autonomy",
                    description: "Achieve 100% domestic renewable energy supply with storage and system integration.",
                    minCost: 30,
                    maxCost: 60,
                    risk: "High",
                    longTerm: "Eliminates energy import dependency",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        gridStability: (cost) => Math.floor(cost * 0.3),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                }
            ]
        },
        "brazil": {
            "turn1": [
                {
                    id: "amazon-protection",
                    name: "Amazon Protection Initiative",
                    description: "Strengthen monitoring and enforcement to prevent illegal deforestation.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "High",
                    longTerm: "Preserves world's largest carbon sink and biodiversity reserve",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.6),
                        publicApproval: (cost) => -Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "hydro-modernization",
                    name: "Hydropower Modernization",
                    description: "Upgrade existing hydroelectric facilities for higher efficiency and output.",
                    minCost: 8,
                    maxCost: 20,
                    risk: "Low",
                    longTerm: "Enhances existing clean energy resources",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        emissions: (cost) => -Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "solar-northeast",
                    name: "Northeast Solar Program",
                    description: "Develop utility-scale solar in the high-insolation northeastern region.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Low",
                    longTerm: "Creates renewable capacity in less-developed region",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        techSolar: (cost) => Math.floor(cost * 0.2),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "biofuel-expansion",
                    name: "Advanced Biofuel Expansion",
                    description: "Expand production of sustainable biofuels from agricultural waste and non-food crops.",
                    minCost: 5,
                    maxCost: 15,
                    risk: "Medium",
                    longTerm: "Strengthens leadership in bioenergy",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.2),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "transmission-expansion",
                    name: "Transmission System Expansion",
                    description: "Strengthen the national grid with new transmission lines connecting renewable resources.",
                    minCost: 7,
                    maxCost: 18,
                    risk: "Medium",
                    longTerm: "Enables integration of new renewable resources",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.4),
                        techGrid: (cost) => Math.floor(cost * 0.2)
                    }
                }
            ],
            "turn2": [
                {
                    id: "sustainable-forestry",
                    name: "Sustainable Forestry Management",
                    description: "Implement sustainable forestry practices that preserve carbon stocks while allowing economic activity.",
                    minCost: 8,
                    maxCost: 20,
                    risk: "Medium",
                    longTerm: "Balances forest preservation with economic needs",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.4),
                        publicApproval: (cost) => Math.floor(cost * 0.2),
                        budget: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "wind-northeast",
                    name: "Northeast Wind Corridor",
                    description: "Develop wind energy corridors in high-potential northeastern coastal regions.",
                    minCost: 7,
                    maxCost: 18,
                    risk: "Low",
                    longTerm: "Creates significant renewable capacity",
                    effects: {
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        techWind: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "solar-manufacturing",
                    name: "Solar Manufacturing Initiative",
                    description: "Develop domestic solar equipment manufacturing capabilities.",
                    minCost: 8,
                    maxCost: 20,
                    risk: "Medium",
                    longTerm: "Creates jobs and reduces import dependency",
                    effects: {
                        techSolar: (cost) => Math.floor(cost * 0.2),
                        budget: (cost) => Math.floor(cost * 0.1),
                        publicApproval: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "airborne-wind",
                    name: "Airborne Wind Energy Systems",
                    description: "Deploy networks of high-altitude wind energy systems to capture jet stream winds.",
                    minCost: 30,
                    maxCost: 60,
                    risk: "Very High",
                    longTerm: "Accesses much stronger and consistent wind resources",
                    effects: {
                        techWind: (cost) => Math.floor(cost * 0.4),
                        emissions: (cost) => -Math.floor(cost * 0.3)
                    }
                },
                {
                    id: "hydrogen-infrastructure",
                    name: "Hydrogen Energy Infrastructure",
                    description: "Build nationwide hydrogen production, storage, and distribution infrastructure.",
                    minCost: 35,
                    maxCost: 70,
                    risk: "High",
                    longTerm: "Creates flexible energy carrier for storage and sector integration",
                    effects: {
                        techStorage: (cost) => Math.floor(cost * 0.4),
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        gridStability: (cost) => Math.floor(cost * 0.2)
                    }
                },
                {
                    id: "fusion-prototype",
                    name: "Fusion Energy Prototype",
                    description: "Fund construction of first commercial-scale fusion energy prototype plant.",
                    minCost: 50,
                    maxCost: 100,
                    risk: "Very High",
                    longTerm: "Potential for unlimited clean energy with minimal waste",
                    effects: {
                        techNuclear: (cost) => Math.floor(cost * 0.6),
                        publicApproval: (cost) => Math.floor(cost * 0.1)
                    }
                },
                {
                    id: "continental-supergrid",
                    name: "Continental Supergrid",
                    description: "Create an integrated energy system connecting the entire continent with neighboring nations.",
                    minCost: 40,
                    maxCost: 80,
                    risk: "High",
                    longTerm: "Enables continent-scale energy optimization and trading",
                    effects: {
                        gridStability: (cost) => Math.floor(cost * 0.5),
                        emissions: (cost) => -Math.floor(cost * 0.3),
                        techGrid: (cost) => Math.floor(cost * 0.4),
                        budget: (cost) => Math.floor(cost * 0.1)
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
                }
            ],
            turn2: [
                {
                    id: "coal-retirement",
                    name: "Coal Capacity Retirement Schedule",
                    description: "Establish a binding timetable for retiring coal plants, starting with the oldest and least efficient.",
                    effects: {
                        publicApproval: -5,
                        emissions: -15
                    },
                    cost: 10,
                    risk: "Medium"
                },
                {
                    id: "electrification",
                    name: "Electrification First Directive",
                    description: "Direct all sectors to prioritize electrification as the primary decarbonization strategy.",
                    cost: 5,
                    effects: {
                        emissions: -7
                    },
                    risk: "Low"
                }
            ],
            turn3: [
                {
                    id: "five-year-plan-15",
                    name: "15th Five-Year Plan Decarbonization Targets",
                    description: "Set ambitious economy-wide decarbonization targets in the national five-year plan.",
                    cost: 10,
                    effects: {
                        emissions: -10
                    },
                    risk: "Low"
                },
                {
                    id: "carbon-intensity",
                    name: "Regional Carbon Intensity Targets",
                    description: "Assign differentiated carbon reduction targets to provinces based on development level and resources.",
                    cost: 5,
                    effects: {
                        emissions: -10
                    },
                    risk: "Medium"
                }
            ],
            turn4: [
                {
                    id: "carbon-neutrality",
                    name: "Carbon Neutrality Implementation Plan",
                    description: "Develop detailed sectoral plans to achieve the national carbon neutrality goal.",
                    cost: 20,
                    effects: {
                        emissions: -15
                    },
                    risk: "Medium"
                },
                {
                    id: "global-south",
                    name: "Global South Clean Energy Partnerships",
                    description: "Form partnerships with developing nations to finance and build clean energy infrastructure.",
                    cost: 30,
                    effects: {
                        budget: 30
                    },
                    risk: "Medium"
                }
            ],
            turn5: [
                {
                    id: "carbon-neutrality-achieve",
                    name: "Carbon Neutrality Achievement Plan",
                    description: "Finalize and implement the comprehensive strategy to achieve carbon neutrality.",
                    cost: 30,
                    effects: {
                        emissions: -20
                    },
                    risk: "Low"
                },
                {
                    id: "climate-leadership",
                    name: "International Climate Leadership Initiative",
                    description: "Position China as the global leader in climate action and clean technology.",
                    cost: 20,
                    effects: {
                        budget: 20,
                        publicApproval: 10
                    },
                    risk: "Low"
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
                }
            ],
            turn2: [
                {
                    id: "hydrogen-mission",
                    name: "Green Hydrogen Mission",
                    description: "Launch a national mission to develop hydrogen production, storage, and utilization capabilities.",
                    cost: 5,
                    effects: {
                        emissions: -2
                    },
                    risk: "Medium"
                },
                {
                    id: "green-corridor",
                    name: "Green Energy Corridor Policy",
                    description: "Develop dedicated transmission infrastructure for renewable energy evacuation.",
                    cost: 3,
                    effects: {
                        gridStability: 7
                    },
                    risk: "Low"
                }
            ],
            turn3: [
                {
                    id: "carbon-market",
                    name: "Carbon Market Implementation",
                    description: "Establish a domestic carbon market with gradually increasing prices.",
                    cost: 3,
                    effects: {
                        emissions: -5,
                        budget: 3
                    },
                    risk: "Medium"
                },
                {
                    id: "energy-equity",
                    name: "Clean Energy Equity Program",
                    description: "Ensure clean energy benefits reach all segments of society, especially rural and low-income.",
                    cost: 7,
                    effects: {
                        publicApproval: 15
                    },
                    risk: "Low"
                }
            ],
            turn4: [
                {
                    id: "climate-resilience",
                    name: "Climate Resilience Framework",
                    description: "Develop a comprehensive approach to climate adaptation across vulnerable sectors.",
                    cost: 10,
                    effects: {
                        publicApproval: 10
                    },
                    risk: "Low"
                },
                {
                    id: "tech-export",
                    name: "Clean Technology Export Strategy",
                    description: "Develop India as an exporter of affordable clean technologies to other developing countries.",
                    cost: 5,
                    effects: {
                        budget: 10
                    },
                    risk: "Medium"
                }
            ],
            turn5: [
                {
                    id: "net-zero",
                    name: "Net-Zero Economy Roadmap",
                    description: "Develop a comprehensive, sector-by-sector plan for achieving net-zero emissions.",
                    cost: 5,
                    effects: {
                        emissions: -15
                    },
                    risk: "Medium"
                },
                {
                    id: "climate-leadership",
                    name: "Global Climate Leadership Initiative",
                    description: "Position India as a leader in sustainable development and climate solutions.",
                    cost: 3,
                    effects: {
                        budget: 5,
                        publicApproval: 10
                    },
                    risk: "Low"
                }
            ]
        },
        germany: {
            turn1: [
                {
                    id: "coal-exit",
                    name: "Coal Exit Acceleration",
                    description: "Accelerate the phase-out of coal power with increased compensation for affected regions.",
                    cost: 15,
                    effects: {
                        emissions: -10,
                        publicApproval: -5
                    },
                    risk: "Medium"
                },
                {
                    id: "carbon-floor",
                    name: "Carbon Price Floor",
                    description: "Establish a minimum carbon price that increases predictably over time.",
                    effects: {
                        publicApproval: -5,
                        budget: 10,
                        emissions: -5
                    },
                    risk: "Medium"
                }
            ],
            turn2: [
                {
                    id: "hydrogen-strategy",
                    name: "National Hydrogen Strategy",
                    description: "Develop a comprehensive strategy for hydrogen production, transport, and use across sectors.",
                    cost: 5,
                    effects: {
                        emissions: -5
                    },
                    risk: "Medium"
                },
                {
                    id: "industrial-roadmaps",
                    name: "Industrial Transformation Roadmaps",
                    description: "Develop detailed decarbonization plans for each major industrial sector.",
                    cost: 3,
                    effects: {
                        emissions: -7
                    },
                    risk: "Low"
                }
            ],
            turn3: [
                {
                    id: "border-adjustment",
                    name: "Carbon Border Adjustment Mechanism",
                    description: "Implement a carbon-based tariff on imports from countries without comparable climate policies.",
                    cost: 3,
                    effects: {
                        budget: 5,
                        emissions: -3
                    },
                    risk: "Medium"
                },
                {
                    id: "climate-finance",
                    name: "Climate Finance Initiative",
                    description: "Mobilize private capital for clean energy projects through innovative financial instruments.",
                    cost: 8,
                    effects: {
                        emissions: -5
                    },
                    risk: "Low"
                }
            ],
            turn4: [
                {
                    id: "certification",
                    name: "Zero-Carbon Industry Certification",
                    description: "Develop certification standards for zero-carbon industrial products to create market premium.",
                    cost: 2,
                    effects: {
                        emissions: -7,
                        budget: 3
                    },
                    risk: "Low"
                },
                {
                    id: "adaptation-strategy",
                    name: "Climate Adaptation Strategy",
                    description: "Develop comprehensive plans to prepare infrastructure and communities for unavoidable climate impacts.",
                    cost: 10,
                    effects: {
                        publicApproval: 10,
                        gridStability: 5
                    },
                    risk: "Low"
                }
            ],
            turn5: [
                {
                    id: "prosperity-plan",
                    name: "Climate Prosperity Plan",
                    description: "Develop an integrated approach to climate action that enhances economic competitiveness.",
                    cost: 5,
                    effects: {
                        publicApproval: 10,
                        emissions: -5,
                        budget: 5
                    },
                    risk: "Low"
                },
                {
                    id: "industrial-leadership",
                    name: "Industrial Leadership Compact",
                    description: "Form a pact with industry to maintain global leadership in clean manufacturing.",
                    cost: 8,
                    effects: {
                        emissions: -10,
                        budget: 10
                    },
                    risk: "Medium"
                }
            ]
        },
        brazil: {
            turn1: [
                {
                    id: "zero-deforestation",
                    name: "Zero Deforestation Policy",
                    description: "Implement strict enforcement against illegal deforestation with international monitoring.",
                    effects: {
                        publicApproval: -5,
                        emissions: -15
                    },
                    cost: 5,
                    risk: "High"
                },
                {
                    id: "renewable-auction",
                    name: "Renewable Energy Auction Program",
                    description: "Expand competitive auctions for renewable energy projects with long-term contracts.",
                    cost: 3,
                    effects: {
                        emissions: -5
                    },
                    risk: "Low"
                }
            ],
            turn2: [
                {
                    id: "forest-conservation",
                    name: "Forest Conservation Payment Program",
                    description: "Pay forest communities and landowners for maintaining forest cover and ecosystem services.",
                    cost: 10,
                    effects: {
                        emissions: -15,
                        publicApproval: 5
                    },
                    risk: "Medium"
                },
                {
                    id: "biofuel-mandate",
                    name: "Biofuel Mandate Expansion",
                    description: "Increase required biofuel blending percentages for transportation fuels.",
                    cost: 4,
                    effects: {
                        emissions: -10,
                        publicApproval: 5
                    },
                    risk: "Low"
                }
            ],
            turn3: [
                {
                    id: "bioeconomy-strategy",
                    name: "Bioeconomy Strategy",
                    description: "Develop high-value products from biodiversity and forest resources without deforestation.",
                    cost: 5,
                    effects: {
                        emissions: -5,
                        budget: 7
                    },
                    risk: "Medium"
                },
                {
                    id: "carbon-pricing",
                    name: "Carbon Pricing System",
                    description: "Implement a national carbon price that increases predictably over time.",
                    effects: {
                        publicApproval: -5,
                        budget: 8,
                        emissions: -7
                    },
                    risk: "Medium"
                }
            ],
            turn4: [
                {
                    id: "circular-economy",
                    name: "Circular Economy Framework",
                    description: "Implement comprehensive regulations to minimize waste and maximize resource efficiency.",
                    cost: 4,
                    effects: {
                        emissions: -5
                    },
                    risk: "Low"
                },
                {
                    id: "amazon-protection",
                    name: "Amazon Permanent Protection Act",
                    description: "Establish permanent legal protection for the Amazon with indigenous rights recognition.",
                    effects: {
                        publicApproval: -10,
                        emissions: -25
                    },
                    risk: "High"
                }
            ],
            turn5: [
                {
                    id: "regenerative-economy",
                    name: "Regenerative Economy Framework",
                    description: "Transform the economy to restore natural systems while providing prosperity.",
                    cost: 5,
                    effects: {
                        emissions: -15,
                        publicApproval: 10
                    },
                    risk: "Medium"
                },
                {
                    id: "south-alliance",
                    name: "Global South Climate Leadership Alliance",
                    description: "Lead a coalition of developing nations to advance climate solutions appropriate for the Global South.",
                    cost: 3,
                    effects: {
                        budget: 10,
                        publicApproval: 5
                    },
                    risk: "Low"
                }
            ]
        }
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
    seenEvents: [],
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
        seenEvents: [],
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
    
    // Check if investments exist for this country and turn
    if (!gameData.investments || !gameData.investments[countryId] || !gameData.investments[countryId][`turn${turn}`]) {
        console.log(`No investments found for ${countryId}, turn ${turn}`);
        investmentsContainer.innerHTML = '<p>No investment options available for this turn.</p>';
        return;
    }
    
    const investmentOptions = gameData.investments[countryId][`turn${turn}`];
    
    investmentsContainer.innerHTML = '';
    
    investmentOptions.forEach(investment => {
        const card = document.createElement('div');
        card.className = 'investment-card';
        card.dataset.id = investment.id;
        
        let effectsHtml = '';
        if (investment.effects) {
            effectsHtml = '<div class="investment-effects"><h4>Effects:</h4>';
            for (const [key, value] of Object.entries(investment.effects)) {
                if (typeof value === 'function') {
                    const midRangeValue = Math.floor((investment.minCost + investment.maxCost) / 2);
                    const effectValue = value(midRangeValue);
                    
                    let displayKey = key;
                    if (key === 'budget') displayKey = 'Budget';
                    else if (key === 'publicApproval') displayKey = 'Public Approval';
                    else if (key === 'gridStability') displayKey = 'Grid Stability';
                    else if (key === 'emissions') displayKey = 'Emissions';
                    else if (key.startsWith('tech')) {
                        const techName = key.replace('tech', '');
                        displayKey = `${techName.charAt(0).toUpperCase() + techName.slice(1)} Technology`;
                    }
                    
                    effectsHtml += `<div class="effect-item">
                        <span>${displayKey}:</span>
                        <span class="effect-value ${effectValue > 0 ? (key === 'emissions' ? 'negative' : 'positive') : effectValue < 0 ? (key === 'emissions' ? 'positive' : 'negative') : 'neutral'}">
                            ${effectValue > 0 ? '+' : ''}${effectValue}${key === 'budget' ? 'B' : '%'}
                        </span>
                    </div>`;
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
            const costValue = e.target.value;
            card.querySelector('.cost-value').textContent = costValue;
            
            // Update displayed effects
            for (const [key, value] of Object.entries(investment.effects)) {
                if (typeof value === 'function') {
                    const effectValue = value(parseInt(costValue));
                    const effectName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    // Find the correct effect item based on text content
                    let effectSpan = null;
                    const effectItems = card.querySelectorAll('.effect-item');
                    effectItems.forEach(item => {
                        const nameSpan = item.querySelector('span:first-child');
                        if (nameSpan && nameSpan.textContent.trim() === effectName + ':') {
                            effectSpan = item.querySelector('.effect-value');
                        }
                    });

                    if (effectSpan) {
                        effectSpan.textContent = `${effectValue > 0 ? '+' : ''}${effectValue}${key === 'budget' ? 'B' : '%'}`;
                    } else {
                        // Optional: Log if the element wasn't found, for debugging
                        // console.warn(`Could not find effect display span for: ${effectName}`);
                    }
                }
            }
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
                    const selectedInvestment = {
                        ...investment,
                        cost: cost,
                        calculatedEffects: {}
                    };
                    
                    // Calculate actual effects based on cost
                    for (const [key, value] of Object.entries(investment.effects)) {
                        if (typeof value === 'function') {
                            selectedInvestment.calculatedEffects[key] = value(cost);
                        }
                    }
                    
                    gameState.selectedInvestments.push(selectedInvestment);
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
    
    // Check if policies exist for this country and turn
    if (!gameData.policies || !gameData.policies[countryId] || !gameData.policies[countryId][`turn${turn}`]) {
        console.log(`No policies found for ${countryId}, turn ${turn}`);
        policiesContainer.innerHTML = '<p>No policies available for this turn.</p>';
        return;
    }
    
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
    
    // Update tech levels
    document.getElementById('tech-solar-value').textContent = `${gameState.techLevels.solar}%`;
    document.getElementById('tech-wind-value').textContent = `${gameState.techLevels.wind}%`;
    document.getElementById('tech-storage-value').textContent = `${gameState.techLevels.storage}%`;
    document.getElementById('tech-nuclear-value').textContent = `${gameState.techLevels.nuclear}%`;
    document.getElementById('tech-grid-value').textContent = `${gameState.techLevels.grid}%`;
    
    document.getElementById('tech-solar-bar').style.width = `${gameState.techLevels.solar}%`;
    document.getElementById('tech-wind-bar').style.width = `${gameState.techLevels.wind}%`;
    document.getElementById('tech-storage-bar').style.width = `${gameState.techLevels.storage}%`;
    document.getElementById('tech-nuclear-bar').style.width = `${gameState.techLevels.nuclear}%`;
    document.getElementById('tech-grid-bar').style.width = `${gameState.techLevels.grid}%`;
}

// Update the turn summary
function updateSummary() {
    document.getElementById('summary-budget').textContent = `$${gameState.budget}B`;
    document.getElementById('summary-approval').textContent = `${gameState.publicApproval}%`;
    document.getElementById('summary-grid').textContent = `${gameState.gridStability}%`;
    document.getElementById('summary-emissions').textContent = `${gameState.emissions}%`;
    
    // Update tech levels in summary
    document.getElementById('summary-solar').textContent = `${gameState.techLevels.solar}%`;
    document.getElementById('summary-wind').textContent = `${gameState.techLevels.wind}%`;
    document.getElementById('summary-storage').textContent = `${gameState.techLevels.storage}%`;
    document.getElementById('summary-nuclear').textContent = `${gameState.techLevels.nuclear}%`;
    document.getElementById('summary-grid-tech').textContent = `${gameState.techLevels.grid}%`;
    
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
            if (investment.calculatedEffects) {
                for (const [key, value] of Object.entries(investment.calculatedEffects)) {
                    applyEffect(key, value);
                }
            }
        });
        
        // Apply effects from policies
        gameState.selectedPolicies.forEach(policy => {
            if (policy.effects) {
                for (const [key, value] of Object.entries(policy.effects)) {
                    applyEffect(key, value);
                }
            }
        });
        
        // Economic growth factor (simple version)
        const growthFactor = 1.1;  // 10% growth per turn
        gameState.budget = Math.round(gameState.budget * growthFactor);
        
        // Reset available budget for next turn
        gameState.availableBudget = gameState.budget;
        
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
    const eventCategories = Object.keys(gameData.events);
    const randomCategory = eventCategories[Math.floor(Math.random() * eventCategories.length)];
    const events = gameData.events[randomCategory];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    // Store current event
    gameState.currentEvent = randomEvent;
    
    // Apply immediate effects
    if (randomEvent.effects) {
        for (const [key, value] of Object.entries(randomEvent.effects)) {
            applyEffect(key, value);
        }
    }
    
    // Display event
    eventContainer.innerHTML = `
        <div class="event-title">${randomEvent.name}</div>
        <div class="event-description">${randomEvent.description}</div>
        
        <div class="response-options">
            <h3>How will you respond?</h3>
            ${randomEvent.responses.map((response, index) => `
                <div class="response-option" data-index="${index}">
                    <div class="response-title">${response.name}</div>
                    <div>${response.description}</div>
                    <div class="card-footer">
                        ${response.cost ? `<div>Cost: $${response.cost}B</div>` : ''}
                        <div class="response-effects">
                            ${Object.entries(response.effects || {}).map(([key, value]) => `
                                <span class="${value > 0 ? (key === 'emissions' ? 'negative' : 'positive') : value < 0 ? (key === 'emissions' ? 'positive' : 'negative') : 'neutral'}">
                                    ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: 
                                    ${value > 0 ? '+' : ''}${value}${key === 'budget' ? 'B' : '%'}
                                </span>
                            `).join(', ')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add event listeners to response options
    document.querySelectorAll('.response-option').forEach(option => {
        option.addEventListener('click', () => {
            const responseIndex = parseInt(option.dataset.index);
            const selectedResponse = randomEvent.responses[responseIndex];
            
            // Check if enough budget is available
            if (selectedResponse.cost && selectedResponse.cost > gameState.availableBudget) {
                showNotification('Not enough budget available for this response');
                return;
            }
            
            // Apply response effects
            if (selectedResponse.cost) {
                gameState.budget -= selectedResponse.cost;
                gameState.availableBudget -= selectedResponse.cost;
            }
            
            if (selectedResponse.effects) {
                for (const [key, value] of Object.entries(selectedResponse.effects)) {
                    applyEffect(key, value);
                }
            }
            
            // Add to event history
            gameState.eventHistory.push({
                event: randomEvent,
                response: selectedResponse
            });
            
            // Show result
            eventContainer.innerHTML = `
                <div class="event-title">${randomEvent.name}</div>
                <div class="event-description">${randomEvent.description}</div>
                
                <div class="event-result">
                    <h3>Your Response: ${selectedResponse.name}</h3>
                    <p>${selectedResponse.description}</p>
                    
                    <div class="event-outcome">
                        <h3>Outcome</h3>
                        <p>You have managed the situation. The effects have been applied to your resources.</p>
                    </div>
                </div>
            `;
            
            // Update resource display
            updateResourceDisplay();
            
            // Show continue button
            eventContinueBtn.style.display = 'inline-block';
        });
    });
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
        seenEvents: [],
        availableBudget: 0
    };
    
    document.body.className = '';
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', init);

// jQuery-like contains selector (needed for the effect update)
Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
};