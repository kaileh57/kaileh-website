import React from 'react';
import './Notification.css'; // We'll create this CSS file next

function Notification({ message, type, visible }) {
  if (!visible) {
    return null;
  }

  // Determine alert class based on type (e.g., 'success', 'error', 'warning')
  // Defaulting to 'alert-info' if type is not recognized or not provided
  const alertClass = type ? `alert-${type}` : 'alert-info';

  return (
    <div className={`notification-toast alert ${alertClass}`} role="alert">
      {message}
    </div>
  );
}

export default Notification;
