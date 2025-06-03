# Clean Energy Transition Game - Additional Investment Options

This repository contains the Clean Energy Transition game, a strategic decision-making game where players take on the role of Energy Minister for a nation starting in 2025, navigating the complex challenges of transitioning to clean energy.

## Adding Additional Investment Options

The file `investment_options.js` contains additional investment options for non-US countries to provide more gameplay variety and balance. To add these options to the main game:

1. Open the `script.js` file in a text editor
2. Locate the `investments` object in the file (~line 1230)
3. For each country section (china, india, germany, brazil), find the appropriate turn arrays (turn1, turn2, etc.)
4. Copy the investment options from `investment_options.js` into the respective country and turn arrays
5. Make sure to preserve the format and add commas between array items correctly

### Example: Adding China's Turn 1 Additional Options

Find the `china` section in the `investments` object of `script.js`, then find the `turn1` array. Add the new options after the existing options:

```javascript
china: {
    turn1: [
        // ... existing options ...
        
        // Add new options here
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
        // ... add more options ...
    ],
    
    // Continue for other turns...
}
```

### Maintaining Balance

When adding these options, consider:

1. Each country should have at least 3-4 options per turn
2. Options should represent a variety of approaches (renewables, efficiency, grid, etc.)
3. Risk levels should be balanced (mix of Low, Medium, High)
4. Effects should be balanced to maintain gameplay integrity

## Game Design Document

The investment options were created based on the comprehensive game design document which outlines realistic energy transition pathways for each nation. The options reflect:

1. Each nation's unique strengths and challenges
2. Realistic technology availability timelines
3. Balanced risk and reward mechanics
4. Alignment with special victory conditions

## Support

If you encounter any issues implementing these additions, please open an issue in the repository or contact the game developers. 