import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Athletes from './components/Athletes';
import Dashboard from './components/Dashboard';
import Shelves from './components/Shelves';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/athletes" element={<Athletes />} />
      <Route path="/shelves" element={<Shelves />} />
    </Routes>
  );
};

export default AppRoutes;