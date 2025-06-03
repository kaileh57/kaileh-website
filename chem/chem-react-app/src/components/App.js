import React, { useState, useEffect } from 'react';
import TitleScreen from './TitleScreen';
import GameScreen from './GameScreen';
import LoadingOverlay from './LoadingOverlay';
import Notification from './Notification';
import './App.css'; // We'll create this later for global styles

function App() {
  const [currentScreen, setCurrentScreen] = useState('title'); // 'title' or 'game'
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const startGame = () => {
    setIsLoading(true);
    // Simulate loading game assets or performing setup
    setTimeout(() => {
      setCurrentScreen('game');
      setIsLoading(false);
      showNotification('Game started!', 'success');
    }, 1000);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, 3000); // Hide after 3 seconds
  };

  return (
    <div className="App">
      {isLoading && <LoadingOverlay />}
      <Notification 
        message={notification.message} 
        type={notification.type} 
        visible={notification.visible} 
      />
      {currentScreen === 'title' && <TitleScreen onStartGame={startGame} />}
      {currentScreen === 'game' && <GameScreen showNotification={showNotification} />}
    </div>
  );
}

export default App;
