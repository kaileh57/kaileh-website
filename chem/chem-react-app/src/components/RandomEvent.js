import React from 'react';

function RandomEvent({ event, onAcknowledge }) {
  if (!event) return null;

  return (
    <div className="event-card">
      <div className="event-header">
        <h5>{event.title}</h5>
      </div>
      <div className="event-body">
        <p>{event.description}</p>
        
        <div className="event-effects">
          <h6>Effects:</h6>
          <ul>
            {Object.entries(event.effects).map(([key, value]) => {
              if (key === 'researchBoost' || key === 'multipliers') return null;
              return (
                <li key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value > 0 ? '+' + value : value}
                </li>
              );
            })}
          </ul>
        </div>
        
        {event.educationalContent && (
          <div className="event-educational">
            <h6>Did You Know?</h6>
            <p>{event.educationalContent}</p>
          </div>
        )}
      </div>
      <div className="event-footer">
        <button 
          className="btn btn-primary" 
          onClick={onAcknowledge}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}

export default RandomEvent; 