import React from 'react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import ApiKeyInput from './components/ApiKeyInput';
import './App.css';

// Initialize icons
initializeIcons();

function App() {
  return (
    <div className="App">
      <ApiKeyInput />
    </div>
  );
}

export default App;