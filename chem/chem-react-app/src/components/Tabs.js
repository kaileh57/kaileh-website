import React from 'react';
// import './Tabs.css'; // May not need if Bootstrap is sufficient

function Tabs({ activeTab, setActiveTab }) {
  const tabsConfig = [
    { id: 'investments', label: 'Investments' },
    { id: 'policies', label: 'Policies' },
    { id: 'summary', label: 'Turn Summary' },
  ];

  return (
    <ul className="nav nav-tabs mb-3" id="game-tabs" role="tablist">
      {tabsConfig.map(tab => (
        <li className="nav-item" role="presentation" key={tab.id}>
          <button 
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            id={`${tab.id}-tab-btn`}
            data-bs-toggle="tab" // Standard Bootstrap attribute
            data-bs-target={`#${tab.id}-tab-pane`} // Standard Bootstrap attribute
            type="button" 
            role="tab" 
            aria-controls={`${tab.id}-tab-pane`}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default Tabs;
