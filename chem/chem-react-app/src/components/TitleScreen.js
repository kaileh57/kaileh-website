import React from 'react';
import './TitleScreen.css'; // We'll create this CSS file next

function TitleScreen({ onStartGame }) {
  return (
    <div className="screen active" id="title-screen">
      <div className="text-center p-5 mb-4 bg-card rounded-3">
        <h1 className="display-4">Electrifying the USA</h1>
        <p className="lead mt-3 mb-4">
          Lead the United States through the monumental challenge of transitioning to a clean energy economy. 
          Balance economic growth, social equity, and environmental stewardship as you make strategic investments, 
          enact powerful policies, and respond to national events to achieve ambitious climate goals by 2050.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onStartGame}>
          Begin the Challenge
        </button>
      </div>

      <div className="card how-to-play-card">
        <div className="card-header h5">How to Play</div>
        <div className="card-body">
          <p>
            "Electrifying the USA" is a strategic decision-making game where you take on the role of a key 
            national leader overseeing America's energy transition, starting in 2025.
          </p>
          <p>Through a series of decisions over 5 turns (25 years), you must:</p>
          <ul className="list-unstyled ms-3 mb-3">
            <li>
              {/* Using a simple checkmark character, can be replaced with an icon library later */}
              <span className="text-success me-2">&#10003;</span> Invest in clean energy technologies and critical infrastructure across the US
            </li>
            <li>
              <span className="text-success me-2">&#10003;</span> Implement federal and state-level policies to guide the transition
            </li>
            <li>
              <span className="text-success me-2">&#10003;</span> Respond to unexpected national events and opportunities
            </li>
            <li>
              <span className="text-success me-2">&#10003;</span> Balance the national budget, public approval, grid stability, and emissions reduction goals
            </li>
          </ul>
          <p>
            The US has unique starting conditions, regional strengths, and diverse challenges. 
            Victory depends on meeting climate commitments while fostering a strong economy and maintaining 
            public support nationwide.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TitleScreen;
