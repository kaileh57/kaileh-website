import React, { useState, useEffect } from 'react';

// Placeholder for an icon component or SVG
const IconPlaceholder = ({ className }) => (
  <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);


const animateDecisionImpact = (element, type = 'neutral') => {
  if (!element) return;
  const currentPosition = window.getComputedStyle(element).position;
  if (currentPosition === 'static') {
    element.style.position = 'relative';
  }

  const impactVisual = document.createElement('div');
  impactVisual.className = `decision-impact ${type}`;

  element.appendChild(impactVisual);

  setTimeout(() => {
    impactVisual.remove();
  }, 1000); // Corresponds to animation duration
};

const InvestmentCard = ({ title, risk, description, effects, onSelect, isSelected }) => {
  const [buttonRef, setButtonRef] = useState(null);

  const handleSelect = () => {
    onSelect();
    animateDecisionImpact(buttonRef, isSelected ? 'neutral' : 'positive');
  };

  return (
    <div className={`investment-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {risk && <span className={`risk-badge ${risk.toLowerCase()}`}>{risk}</span>}
      </div>
      <p className="card-description">{description}</p>
      {effects && effects.length > 0 && (
        <div className="card-effects">
          {effects.map((effect, index) => (
            <div className="effect-item" key={index}>
              <span className="effect-label">{effect.label}</span>
              <span className={`effect-value ${effect.type}`}>{effect.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="card-actions">
        <button 
          ref={setButtonRef} 
          className="btn btn-primary select-investment" 
          onClick={handleSelect}
        >
          {isSelected ? 'Deselect' : 'Select'}
        </button>
      </div>
    </div>
  );
};

const TechIndicator = ({ techId, name, percentage, level }) => {
    const strokeDasharray = `${percentage}, 100`;
    const [showBreakthrough, setShowBreakthrough] = useState(false);

    // Example: Trigger breakthrough animation when level changes or on initial high level
    useEffect(() => {
        if (level >= 3) { // Arbitrary condition for breakthrough
            setShowBreakthrough(true);
            const timer = setTimeout(() => setShowBreakthrough(false), 1500); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [level]);

    return (
        <div className="tech-item" data-tech-id={techId}>
            <div className="tech-name">{name}</div>
            <div className="tech-circle-container">
                <svg className="tech-circle" viewBox="0 0 36 36">
                    <path className="tech-circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeWidth="3" strokeLinecap="round" />
                    <path className="tech-circle-fill"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeWidth="3" strokeLinecap="round"
                        style={{ strokeDasharray: strokeDasharray }} />
                </svg>
                <div className="tech-value">{percentage}%</div>
                {showBreakthrough && <div className="tech-breakthrough show"></div>}
            </div>
            <div className="tech-level">Level {level}</div>
        </div>
    );
};

const Timeline = ({ steps, currentStep, events }) => {
    const progressPercentage = ((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100;

    return (
        <div className="timeline-container">
            <div className="timeline-track">
                <div className="timeline-fill" style={{ width: `${progressPercentage}%` }}></div>
                {steps.map((step, index) => (
                    <div 
                        key={step.id} 
                        className={`timeline-step ${step.id === currentStep ? 'active' : (index < steps.findIndex(s => s.id === currentStep) ? 'completed' : '')}`}
                        style={{ left: `${((index + 0.5) / steps.length) * 100}%` }}
                        data-step={step.id}
                    >
                        <div className="timeline-marker"></div>
                        <div className="timeline-label">{step.label}</div>
                    </div>
                ))}
                {events && events.map(event => (
                    <div 
                        key={event.id} 
                        className="timeline-event" 
                        style={{ left: event.position }}
                    >
                        <div className="timeline-event-marker"></div>
                        <div className="timeline-event-label">{event.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}


const MainContent = () => {
  const [selectedCards, setSelectedCards] = useState([]);

  const handleCardSelect = (cardTitle) => {
    setSelectedCards(prevSelected =>
      prevSelected.includes(cardTitle)
        ? prevSelected.filter(title => title !== cardTitle)
        : [...prevSelected, cardTitle]
    );
  };

  // Placeholder data
  const investmentCardsData = [
    {
      title: 'Solar Panel Subsidies',
      risk: 'Low',
      description: 'Provide financial incentives for solar panel installations.',
      effects: [
        { label: 'CO2 Reduction', value: '-5 Mt', type: 'positive' },
        { label: 'Budget Impact', value: '-$10B', type: 'negative' },
      ],
    },
    {
      title: 'Wind Turbine Development',
      risk: 'Medium',
      description: 'Invest in new offshore wind farms.',
      effects: [
        { label: 'CO2 Reduction', value: '-8 Mt', type: 'positive' },
        { label: 'Public Approval', value: '+3%', type: 'positive' },
        { label: 'Budget Impact', value: '-$15B', type: 'negative' },
      ],
    },
  ];

  const techData = [
        { id: "solar", name: "Solar", percentage: 60, level: 3 },
        { id: "wind", name: "Wind", percentage: 45, level: 2 },
        { id: "storage", name: "Storage", percentage: 70, level: 4 },
        { id: "nuclear", name: "Nuclear", percentage: 30, level: 1 },
        { id: "grid", name: "Grid Stability", percentage: 55, level: 2 },
    ];

  const timelineSteps = [
        { id: 1, label: "2025-2030" },
        { id: 2, label: "2030-2035" },
        { id: 3, label: "2035-2040" },
        { id: 4, label: "2040-2045" },
        { id: 5, label: "2045-2050" },
    ];
    const timelineEvents = [
        { id: 'event1', label: "Climate Summit", position: "40%" },
        { id: 'event2', label: "Tech Breakthrough", position: "75%" },
    ];

  return (
    <main className="game-main">
      <h2>Investments & Policies</h2>
      <div className="investment-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {investmentCardsData.map(card => (
          <InvestmentCard
            key={card.title}
            {...card}
            onSelect={() => handleCardSelect(card.title)}
            isSelected={selectedCards.includes(card.title)}
          />
        ))}
      </div>

      <div className="tech-levels">
        <h3 className="section-title">Technology Levels</h3>
        <div className="tech-grid">
            {techData.map(tech => <TechIndicator key={tech.id} {...tech} />)}
        </div>
      </div>

      <Timeline steps={timelineSteps} currentStep={2} events={timelineEvents} />

      {/* Placeholder for other game content like events, results etc. */}
      <p className="text-dim">Further game content will appear here.</p>

    </main>
  );
};

export default MainContent; 