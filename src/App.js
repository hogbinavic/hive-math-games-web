import React, { useState } from 'react';
import HiveAssess from './HiveAssess';
import HiveRisk from './HiveRisk';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('assess');

  return (
    <div className="app">
      <nav className="tabs">
        <button
          className={activeTab === 'assess' ? 'active' : ''}
          onClick={() => setActiveTab('assess')}
        >
          Hive Assess
        </button>
        <button
          className={activeTab === 'risk' ? 'active' : ''}
          onClick={() => setActiveTab('risk')}
        >
          Hive Risk
        </button>
      </nav>
      <div className="content">
        {activeTab === 'assess' ? <HiveAssess /> : <HiveRisk />}
      </div>
    </div>
  );
};

export default App;