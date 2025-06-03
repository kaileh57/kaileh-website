import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  return (
    <>
      <div id="grain-overlay"></div>
      <div className="game-container">
        <Header />
        <Sidebar />
        <MainContent />
        {/* 
          The guide mentions screen-specific enhancements for Title, Events, and Results screens.
          These would typically be handled by a router or conditional rendering within MainContent 
          or by swapping out MainContent for different screen components.
          For now, MainContent contains a placeholder for general game interactions.
        */}
      </div>
    </>
  );
}

export default App;
