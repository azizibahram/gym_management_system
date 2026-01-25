import { Dashboard, FitnessCenter, Logout, Storage } from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // initialise with a safe fallback
  const [currentTab, setCurrentTab] = useState<string>(location.pathname ?? '/');

  // update when the route changes
  useEffect(() => {
    setCurrentTab(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* inject keyframes for the navbar gradient animation */}
      <style>{`
        @keyframes navbarGradientShift {
          0%   { background-position: 0% 0%; }
          50%  { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Floating Navigation Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          width: 'calc(100% - 40px)',
          maxWidth: '1200px',
        }}
      >
        {/* Navbar container – animated gradient background */}
        <Box
          sx={{
            /* vibrant gradient – same style as the login page */
            background: 'linear-gradient(135deg,  #381024,#5f2c82,#17418f,#0f0f3a)',
            backgroundSize: '400% 400%',               // enable movement
            animation: 'navbarGradientShift 12s ease infinite, slideDown 0.6s ease-out',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Logo Section – animated icon & gradient text */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            {/* animated circular logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 45,
                height: 45,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff7e5f, #feb47b, #86a8e7, #7f7fd5)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 8s linear infinite, logoSpin 6s linear infinite',
                mr: 2,
                boxShadow: '0 4px 15px rgba(255,126,95,0.4)',
              }}
            >
              <FitnessCenter sx={{ fontSize: 24, color: 'white' }} />
            </Box>

            {/* animated gradient text */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ff7e5f, #feb47b, #86a8e7, #7f7fd5)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 8s linear infinite',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              Energy Gym
            </Typography>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                p: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {[
                { icon: <Dashboard />, label: 'Dashboard', value: '/' },
                { icon: <FitnessCenter />, label: 'Athletes', value: '/athletes' },
                { icon: <Storage />, label: 'Shelves', value: '/shelves' },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  onClick={() => navigate(tab.value)}   // direct navigation
                  startIcon={tab.icon}
                  sx={{
                    color: currentTab === tab.value ? '#fff' : 'rgba(255,255,255,0.8)',
                    background:
                      currentTab === tab.value
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                        : 'transparent',
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    mx: 0.5,
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: currentTab === tab.value ? 600 : 500,
                    minWidth: 'auto',
                    boxShadow:
                      currentTab === tab.value
                        ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                        : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background:
                        currentTab === tab.value
                          ? 'linear-gradient(135deg, #764ba2 0%, #f093fb 50%, #667eea 100%)'
                          : 'rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textTransform: 'none',
              fontSize: '14px',
              px: 3,
              py: 1,
              borderRadius: 2.5,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content with top padding for floating navbar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: '#f5f5f5',
          pt: 12,
          pb: 4,
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* Footer (unchanged) */}
      <Box
        component="footer"
        sx={{
          py: 2.5,
          px: 2,
          mt: 'auto',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
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