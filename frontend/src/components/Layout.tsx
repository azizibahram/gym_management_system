import { Dashboard, FitnessCenter, Logout, Storage } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(location.pathname);

  useEffect(() => {
    setCurrentTab(location.pathname);
  }, [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    navigate(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          <FitnessCenter sx={{ fontSize: 36, mr: 2 }} />
          <Typography variant="h5" sx={{ flexGrow: 0, fontWeight: 700, mr: 6 }}>
            Energy Gym
          </Typography>

          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: '#fff',
                height: 4,
                borderRadius: '4px 4px 0 0'
              }
            }}
            sx={{ flexGrow: 1 }}
          >
            <Tab
              icon={<Dashboard />}
              iconPosition="start"
              label="Dashboard"
              value="/"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': { color: '#fff', fontWeight: 600 },
                minHeight: 70,
                textTransform: 'none',
                fontSize: '16px',
                px: 3
              }}
            />
            <Tab
              icon={<FitnessCenter />}
              iconPosition="start"
              label="Athletes"
              value="/athletes"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': { color: '#fff', fontWeight: 600 },
                minHeight: 70,
                textTransform: 'none',
                fontSize: '16px',
                px: 3
              }}
            />
            <Tab
              icon={<Storage />}
              iconPosition="start"
              label="Shelves"
              value="/shelves"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': { color: '#fff', fontWeight: 600 },
                minHeight: 70,
                textTransform: 'none',
                fontSize: '16px',
                px: 3
              }}
            />
          </Tabs>

          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              textTransform: 'none',
              fontSize: '16px',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f7fa',
          py: 4
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2.5,
          px: 2,
          mt: 'auto',
          backgroundColor: '#fff',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2026 Energy Gym Management System - All Rights Reserved
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;