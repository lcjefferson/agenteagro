import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ChatHistory from './pages/ChatHistory';
import Settings from './pages/Settings';
import MapPage from './pages/MapPage';
import LocationAnalytics from './pages/LocationAnalytics';
import Professionals from './pages/Professionals';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat-history" element={<ChatHistory />} />
          <Route path="/analytics" element={<LocationAnalytics />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
