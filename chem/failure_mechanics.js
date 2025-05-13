/**
 * Failure Mechanics for Electrifying the USA Game
 * 
 * This module adds project failure mechanics to the game, making risk levels
 * meaningful by creating a chance that investment projects can fail based on
 * their risk level, allocated funding, and related technology levels.
 */

/**
 * Calculate the probability of an investment project failing based on risk level,
 * allocated funding, and relevant technology levels
 * 
 * @param {Object} investment - The investment object with risk property
 * @param {Number} allocatedAmount - The amount of money allocated to the project
 * @returns {Number} Failure probability (0-1)
 */
function calculateFailureChance(investment, allocatedAmount) {
    // Base failure chance depends on risk level
    const baseFailureChance = {
        "Low": 0.10,
        "Medium": 0.25,
        "High": 0.40,
        "Very High": 0.60
    }[investment.risk] || 0.25;
    
    // Spending more reduces failure chance (diminishing returns)
    // Minimum effective spending ratio - below this doesn't reduce risk
    const minSpendingRatio = 0.6;
    const spendingRatio = Math.min(1, allocatedAmount / investment.maxCost);
    const spendingMultiplier = spendingRatio < minSpendingRatio ? 
        1 : (1 - ((spendingRatio - minSpendingRatio) / (1 - minSpendingRatio)) * 0.7);
    
    // Tech level reduces failure chance for related projects
    const relatedTech = determineRelatedTech(investment);
    let techBonus = 0;
    
    relatedTech.forEach(tech => {
        if (gameState.techLevels && gameState.techLevels[tech]) {
            techBonus += (gameState.techLevels[tech] / 100) * 0.3;
        }
    });
    
    // Average the tech bonus if multiple technologies are relevant
    techBonus = techBonus / Math.max(1, relatedTech.length);
    
    // Calculate final failure chance with a minimum floor of 5%
    return Math.max(0.05, Math.min(0.95, baseFailureChance * spendingMultiplier * (1 - techBonus)));
}

/**
 * Determine which technologies are most related to an investment based on its effects
 * 
 * @param {Object} investment - The investment object with effects property
 * @returns {Array} Array of related technology keys
 */
function determineRelatedTech(investment) {
    const relatedTech = [];
    const effects = investment.effects || {};
    
    // Check effect keys that start with "tech" to determine related technologies
    for (const key in effects) {
        if (key.startsWith('tech') && typeof effects[key] === 'function') {
            // Convert techSolar to solar, etc.
            const tech = key.replace('tech', '').toLowerCase();
            relatedTech.push(tech);
        }
    }
    
    // If no direct tech effects, infer from other effects
    if (relatedTech.length === 0) {
        if (effects.emissions) relatedTech.push('solar', 'wind');
        if (effects.gridStability) relatedTech.push('grid', 'storage');
    }
    
    return [...new Set(relatedTech)]; // Remove duplicates
}

/**
 * Update UI to show current risk level for an investment
 * 
 * @param {HTMLElement} container - The investment card element
 * @param {Object} investment - The investment object
 * @param {Number} amount - The allocated amount
 */
function updateRiskDisplay(container, investment, amount) {
    const failureChance = calculateFailureChance(investment, amount);
    const failurePercentage = Math.round(failureChance * 100);
    
    // Find or create risk display elements
    let riskSection = container.querySelector('.risk-assessment');
    if (!riskSection) {
        riskSection = document.createElement('div');
        riskSection.className = 'risk-assessment';
        riskSection.innerHTML = `
            <div><strong>Failure Risk:</strong> <span class="failure-chance">Calculating...</span></div>
            <div class="risk-progress">
                <div class="failure-risk-bar" role="progressbar" 
                     style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;
        
        // Insert before action buttons
        const actionSection = container.querySelector('.investment-action');
        if (actionSection) {
            container.insertBefore(riskSection, actionSection);
        } else {
            container.appendChild(riskSection);
        }
    }
    
    // Update risk display
    const failureSpan = riskSection.querySelector('.failure-chance');
    const failureRiskBar = riskSection.querySelector('.failure-risk-bar');
    
    if (failureSpan && failureRiskBar) {
        failureSpan.textContent = `${failurePercentage}%`;
        failureRiskBar.style.width = `${failurePercentage}%`;
        
        // Update color based on risk level
        if (failurePercentage < 15) {
            failureRiskBar.className = 'failure-risk-bar bg-success';
            failureSpan.className = 'failure-chance text-success';
        } else if (failurePercentage < 35) {
            failureRiskBar.className = 'failure-risk-bar bg-warning';
            failureSpan.className = 'failure-chance text-warning';
        } else {
            failureRiskBar.className = 'failure-risk-bar bg-danger';
            failureSpan.className = 'failure-chance text-danger';
        }
    }
}

/**
 * Process investment results with failure chance
 * 
 * @param {Array} investments - Array of investment objects
 * @returns {Array} Results with success/failure flags
 */
function processInvestmentResults(investments) {
    const results = [];
    
    investments.forEach(investment => {
        // Get original investment data to calculate risk
        let originalInvestment = investment;
        try {
            const turn = `turn${gameState.turn}`;
            originalInvestment = gameData.investments[gameState.selectedCountry][turn].find(
                opt => opt.id === investment.id
            ) || investment;
        } catch (error) {
            console.warn(`Could not find original investment: ${error}`);
        }
        
        const failureChance = calculateFailureChance(originalInvestment, investment.cost);
        const success = Math.random() > failureChance;
        
        if (success) {
            // Full benefits already applied during normal processing
            results.push({
                id: investment.id,
                name: investment.name,
                success: true,
                amount: investment.cost
            });
        } else {
            // Project failed - apply only partial benefits 
            const recoveryRate = Math.random() * 0.3; // 0-30% of benefits
            
            // We need to modify the benefits that were already applied
            if (investment.calculatedEffects) {
                for (const [key, value] of Object.entries(investment.calculatedEffects)) {
                    // Reduce the already applied effect
                    const adjustmentValue = Math.round(value * (recoveryRate - 1)); // Negative adjustment
                    applyEffect(key, adjustmentValue);
                }
            }
            
            results.push({
                id: investment.id,
                name: investment.name,
                success: false,
                amount: investment.cost,
                recovered: Math.round(recoveryRate * 100)
            });
            
            // Notify the user
            showNotification(`Project failed: ${investment.name}`, 'danger');
        }
        
        // Record in project history
        recordProjectOutcome(investment, success, failureChance);
    });
    
    return results;
}

/**
 * Record the outcome of a project in the game history
 */
function recordProjectOutcome(investment, success, riskLevel) {
    if (!gameState.projectHistory) gameState.projectHistory = [];
    
    gameState.projectHistory.push({
        id: investment.id,
        name: investment.name,
        turn: gameState.turn,
        year: `${2025 + (gameState.turn-1)*5}-${2025 + gameState.turn*5}`,
        success: success,
        risk: investment.risk || 'Unknown',
        riskLevel: riskLevel,
        amount: investment.cost
    });
}

/**
 * Display investment results in the UI
 * 
 * @param {Array} results - Array of result objects with success/failure info
 * @param {HTMLElement} container - Container to add results to
 */
function displayInvestmentResults(results, container) {
    if (!container) {
        container = document.getElementById('investment-results');
        if (!container) {
            container = document.createElement('div');
            container.id = 'investment-results';
            container.className = 'investment-results';
            
            // Try to add to summary tab
            const summaryTab = document.getElementById('summary-tab-pane');
            if (summaryTab) {
                const proceedButton = summaryTab.querySelector('button');
                if (proceedButton) {
                    summaryTab.insertBefore(container, proceedButton.parentElement);
                } else {
                    summaryTab.appendChild(container);
                }
            } else {
                // Fallback - add to body
                document.body.appendChild(container);
            }
        }
    }
    
    // Clear container
    container.innerHTML = '<h4>Investment Outcomes</h4>';
    
    // Create result cards
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = `investment-result ${result.success ? 'success' : 'failure'}`;
        
        if (result.success) {
            resultElement.innerHTML = `
                <div class="result-icon success">✓</div>
                <div class="result-details">
                    <div class="result-title">${result.name} - SUCCESS</div>
                    <div class="result-subtitle">$${result.amount}B investment fully implemented</div>
                </div>
            `;
        } else {
            resultElement.innerHTML = `
                <div class="result-icon failure">✗</div>
                <div class="result-details">
                    <div class="result-title">${result.name} - FAILED</div>
                    <div class="result-subtitle">$${result.amount}B investment yielded only ${result.recovered}% returns</div>
                </div>
            `;
        }
        
        container.appendChild(resultElement);
    });
} 