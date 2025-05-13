# Project Failure Mechanics Implementation

## Overview
This feature adds risk-based project failure to the game, making risk levels meaningful and incentivizing players to strategically allocate more money to high-risk, high-reward projects.

## Key Components

### 1. Failure Probability Calculation
```javascript
function calculateFailureChance(investment, allocatedAmount) {
  // Base failure chance depends on risk level
  const baseFailureChance = {
    "Low": 0.10,
    "Medium": 0.25,
    "High": 0.40,
    "Very High": 0.60
  }[investment.risk] || 0.25;
  
  // Spending more reduces failure chance (diminishing returns)
  const minSpendingRatio = 0.6; // Minimum effective spending
  const spendingRatio = Math.min(1, allocatedAmount / investment.maxCost);
  const spendingMultiplier = spendingRatio < minSpendingRatio ? 
    1 : (1 - ((spendingRatio - minSpendingRatio) / (1 - minSpendingRatio)) * 0.7);
  
  // Tech level reduces failure chance for related projects
  // Get relevant techs based on investment type
  const relatedTech = determineRelatedTech(investment);
  let techBonus = calculateTechBonus(relatedTech);
  
  return Math.max(0.05, Math.min(0.95, baseFailureChance * spendingMultiplier * (1 - techBonus)));
}
```

### 2. Investment UI Enhancements
- Add risk indicator display to investment cards
- Show dynamic failure probability that updates as funding is adjusted
- Color-code risk levels (green < 15%, yellow < 35%, red >= 35%)

### 3. Processing Project Results
```javascript
// In processEndOfTurn function:
gameState.selectedInvestments.forEach(investment => {
  // Calculate failure chance
  const failureChance = calculateFailureChance(investment.option, investment.amount);
  const success = Math.random() > failureChance;
  
  if (success) {
    // Apply full effects
    applyFullInvestmentEffects(investment);
  } else {
    // Project failed - apply partial benefits
    const recoveryRate = Math.random() * 0.3; // 0-30% of benefits
    applyPartialInvestmentEffects(investment, recoveryRate);
    showNotification(`Project failed: ${investment.name}`, 'danger');
  }
  
  // Record in project history
  recordProjectResult(investment, success);
});
```

### 4. Results Display
- Show success/failure status for each project in the turn summary
- Include the percentage of benefits recovered for failed projects
- Visual cues (green check vs. red X) for success/failure

### 5. Game Balance Considerations
- Base failure rates: Low (10%), Medium (25%), High (40%), Very High (60%)
- Funding at maximum reduces failure chance by up to 70%
- Technology levels can reduce failure chance by up to 30%
- Minimum failure chance floor of 5% even with max spending/tech
- Failed projects recover 0-30% of their intended benefits

## Implementation Steps
1. Add the failure calculation functions
2. Modify investment UI to show risk
3. Update slider events to dynamically display risk
4. Enhance processEndOfTurn to include failure mechanics
5. Add historical tracking of project outcomes
6. Create visual feedback for successes and failures

## Future Enhancements
- Special country traits affecting failure rates
- Policy options that can improve success rates
- Risk mitigation technologies
- Special events triggered by project failures 