import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Athletes = lazy(() => import('./components/Athletes'));
const Shelves = lazy(() => import('./components/Shelves'));

// Loading fallback component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
  >
    <CircularProgress />
  </Box>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/shelves" element={<Shelves />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;