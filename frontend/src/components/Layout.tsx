import { Dashboard, FitnessCenter, Logout, Notifications, Storage } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Container, IconButton, Link, Menu, MenuItem, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
interface LayoutProps {
  children: React.ReactNode;
}

interface AlertData {
  id: number;
  full_name: string;
  days_left: number;
  gym_type: string;
  contact_number: string;
  photo: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname;
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  // fetch alerts
  const fetchAlerts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleAlertClick = (alert: AlertData) => {
    setNotificationsAnchor(null);
    navigate('/athletes', { state: { openProfileId: alert.id } });
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

          {/* Notifications Bell */}
          <IconButton
            onClick={handleNotificationsClick}
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mr: 2,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Badge badgeContent={alerts.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          {/* Debug: {alerts.length} */}

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

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
            overflow: 'auto',
          },
        }}
      >
        {alerts.length === 0 ? (
          <MenuItem disabled>
            <Typography>No alerts</Typography>
          </MenuItem>
        ) : (
          alerts.map((alert) => (
            <MenuItem key={alert.id} onClick={() => handleAlertClick(alert)}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Avatar
                  src={alert.photo ? (alert.photo.startsWith('http') ? alert.photo : `http://localhost:8000${alert.photo}`) : undefined}
                  alt={alert.full_name}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  {!alert.photo && alert.full_name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alert.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {alert.gym_type} • {alert.contact_number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alert.days_left < 0 ? 'error.main' : alert.days_left <= 3 ? 'warning.main' : 'text.secondary',
                      fontWeight: 'bold'
                    }}
                  >
                    {alert.days_left < 0 ? `${Math.abs(alert.days_left)} days overdue` : `${alert.days_left} days left`}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#667eea' }}>
                Bahram Azizi
              </Typography>
              <IconButton
                component={Link}
                href="https://www.linkedin.com/in/bahramazizi1996"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#0077b5',
                  '&:hover': { backgroundColor: 'rgba(0, 119, 181, 0.1)' },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;