import React, { useState, useEffect } from 'react';

const WelcomeBanner = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-light)',
        textAlign: 'center',
        padding: '1.5rem',
        zIndex: '10000',
        fontSize: '2rem',
        borderBottom: '2px solid var(--primary)',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        transition: 'opacity 0.5s ease-out',
        opacity: visible ? 1 : 0,
      }}
    >
      Electrifying the USA
      <p style={{fontSize: '1rem', color: 'var(--text-dim)', marginTop: '0.5rem'}}>
        Lead the United States through the monumental challenge of transitioning to a clean energy economy. Balance economic growth, social equity, and environmental stewardship as you make strategic investments, enact powerful policies, and respond to national events to achieve ambitious climate goals by 2050.
      </p>
    </div>
  );
};

export default WelcomeBanner; 