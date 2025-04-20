import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BadgeView from './components/BadgeView';
import ClimateConditionsView from './components/ClimateConditionsView';

const FarmIframe: React.FC = () => (
  <div style={{ width: '100vw', height: '100vh', border: 0, padding: 0, margin: 0 }}>
    <iframe
      src="http://localhost:3000"
      title="Farm Game Interface"
      style={{ width: '100%', height: '100%', border: 'none' }}
      allow="clipboard-write; clipboard-read"
    />
  </div>
);

const App: React.FC = () => (
  <Routes>
    <Route path="/farm" element={<FarmIframe />} />
    <Route path="/badges" element={<BadgeView />} />
    <Route path="/climate-conditions" element={<ClimateConditionsView />} />
    <Route path="/*" element={<Layout />} />
  </Routes>
);

export default App;
