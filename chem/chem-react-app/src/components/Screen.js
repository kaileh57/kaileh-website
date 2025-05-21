import React from 'react';

// A very generic Screen component. 
// Its utility might be limited if screens have highly custom structures and visibility logic.
function Screen({ children, isActive, id, className }) {
  if (!isActive) {
    return null;
  }

  return (
    <div className={`screen ${isActive ? 'active' : ''} ${className || ''}`} id={id}>
      {children}
    </div>
  );
}

export default Screen;
