import React from 'react';

// Placeholder for an icon component or SVG
const IconPlaceholder = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ResourceItem = ({ iconBgColor, iconColor, label, value, trend, trendType }) => {
  // Add the 'resource-value-animated' class for the countUp animation
  // The actual animation will trigger when the value changes if state is managed appropriately
  return (
    <div className="resource-item">
      <div className="resource-icon" style={{ backgroundColor: iconBgColor }}>
        <IconPlaceholder color={iconColor || 'var(--primary)'} />
      </div>
      <div className="resource-info">
        <div className="resource-label">{label}</div>
        <div className="resource-value resource-value-animated" id={`${label.toLowerCase().replace(' ', '-')}-value`}>{value}</div>
      </div>
      {trend && <div className={`resource-trend ${trendType}`}>{trend}</div>}
    </div>
  );
};

const Sidebar = () => {
  // Placeholder data - this would come from game state
  const resources = [
    {
      label: 'Budget',
      value: '$120B',
      trend: '+5%',
      trendType: 'positive',
      iconBgColor: 'rgba(0, 153, 255, 0.2)',
      iconColor: 'var(--primary)'
    },
    {
      label: 'Public Approval',
      value: '65%',
      trend: '-3%',
      trendType: 'negative',
      iconBgColor: 'rgba(255, 179, 71, 0.2)',
      iconColor: 'var(--accent)'
    },
    {
      label: 'CO2 Emissions',
      value: '450 Mt',
      trend: '+1%',
      trendType: 'negative',
      iconBgColor: 'rgba(255, 90, 95, 0.2)',
      iconColor: 'var(--danger)'
    },
     {
      label: 'Energy Security',
      value: '80%',
      trend: '+2%',
      trendType: 'positive',
      iconBgColor: 'rgba(35, 206, 107, 0.2)',
      iconColor: 'var(--success)'
    }
  ];

  return (
    <aside className="game-sidebar">
      <div className="resource-panel">
        {resources.map(resource => (
          <ResourceItem
            key={resource.label}
            iconBgColor={resource.iconBgColor}
            iconColor={resource.iconColor}
            label={resource.label}
            value={resource.value}
            trend={resource.trend}
            trendType={resource.trendType}
          />
        ))}
      </div>
      {/* Placeholder for navigation or other sidebar elements */}
      <nav className="sidebar-nav">
        <p className="text-dim">Navigation</p>
        {/* Add nav links here */}
      </nav>
    </aside>
  );
};

export default Sidebar; 