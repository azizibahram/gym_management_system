import { Dashboard, FitnessCenter, Logout, Notifications, Storage, VpnKey } from '@mui/icons-material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Avatar, Badge, Box, Button, Container, Fade, IconButton, Link, Menu, MenuItem, Slide, Typography, Zoom } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChangePassword from './ChangePassword';

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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
    const loadData = async () => {
      await fetchAlerts();
    };
    loadData();
    const timer = setTimeout(() => setLoaded(true), 100);
    // Refresh alerts every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
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

  const navItems = [
    { icon: <Dashboard />, label: 'Dashboard', value: '/' },
    { icon: <FitnessCenter />, label: 'Athletes', value: '/athletes' },
    { icon: <Storage />, label: 'Shelves', value: '/shelves' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
        <Slide in={loaded} direction="down" timeout={500}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 50%, rgba(236, 72, 153, 0.9) 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 8s ease infinite',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(20px)',
              '@keyframes gradientShift': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
            }}
          >
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 45,
                  height: 45,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)',
                  mr: 2,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                  },
                }}
              >
                <FitnessCenter sx={{ fontSize: 24, color: '#6366f1' }} />
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.02em',
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
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 3,
                  p: 0.5,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {navItems.map((tab, index) => (
                  <Zoom in={loaded} style={{ transitionDelay: `${index * 100}ms` }} key={tab.value}>
                    <Button
                      onClick={() => navigate(tab.value)}
                      startIcon={tab.icon}
                      sx={{
                        color: currentTab === tab.value ? '#6366f1' : 'rgba(255,255,255,0.9)',
                        background: currentTab === tab.value
                          ? 'white'
                          : 'transparent',
                        borderRadius: 2.5,
                        px: 3,
                        py: 1,
                        mx: 0.5,
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: currentTab === tab.value ? 700 : 600,
                        minWidth: 'auto',
                        boxShadow: currentTab === tab.value
                          ? '0 4px 15px rgba(0,0,0,0.2)'
                          : 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: currentTab === tab.value
                            ? 'white'
                            : 'rgba(255, 255, 255, 0.25)',
                          color: currentTab === tab.value ? '#6366f1' : 'white',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {tab.label}
                    </Button>
                  </Zoom>
                ))}
              </Box>
            </Box>

            {/* Notifications Bell */}
            <Zoom in={loaded} style={{ transitionDelay: '400ms' }}>
              <IconButton
                onClick={handleNotificationsClick}
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mr: 2,
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Badge
                  badgeContent={alerts.length}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      animation: alerts.length > 0 ? 'pulse 2s infinite' : 'none',
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      padding: '0 4px',
                    }
                  }}
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </Zoom>

            {/* Change Password Button */}
            <Zoom in={loaded} style={{ transitionDelay: '500ms' }}>
              <IconButton
                onClick={() => setChangePasswordOpen(true)}
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mr: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <VpnKey />
              </IconButton>
            </Zoom>

            {/* Logout Button */}
            <Zoom in={loaded} style={{ transitionDelay: '600ms' }}>
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
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Logout
              </Button>
            </Zoom>
          </Box>
        </Slide>
      </Box>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxHeight: 450,
            overflow: 'auto',
            borderRadius: 3,
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
        TransitionComponent={Zoom}
      >
        {alerts.length === 0 ? (
          <MenuItem disabled>
            <Box sx={{ py: 2, textAlign: 'center', width: '100%' }}>
              <Typography color="text.secondary">No alerts at this time</Typography>
            </Box>
          </MenuItem>
        ) : (
          alerts.map((alert, index) => (
            <Fade in={true} timeout={300 + index * 100} key={alert.id}>
              <MenuItem onClick={() => handleAlertClick(alert)} sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar
                    src={alert.photo ? (alert.photo.startsWith('http') ? alert.photo : `http://localhost:8000${alert.photo}`) : undefined}
                    alt={alert.full_name}
                    sx={{ 
                      width: 44, 
                      height: 44, 
                      mr: 2,
                      border: '2px solid',
                      borderColor: alert.days_left < 0 ? '#ef4444' : alert.days_left <= 3 ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {!alert.photo && alert.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1e293b' }}>
                      {alert.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {alert.gym_type} • {alert.contact_number}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: alert.days_left < 0 ? '#ef4444' : alert.days_left <= 3 ? '#f59e0b' : '#64748b',
                        fontWeight: 700,
                        display: 'inline-block',
                        mt: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        background: alert.days_left < 0 ? 'rgba(239, 68, 68, 0.1)' : alert.days_left <= 3 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      }}
                    >
                      {alert.days_left < 0 ? `${Math.abs(alert.days_left)} days overdue` : `${alert.days_left} days left`}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Fade>
          ))
        )}
      </Menu>

      {/* Main Content with top padding for floating navbar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: 'transparent',
          pt: 14,
          pb: 4,
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* Footer */}
      <Fade in={loaded} timeout={1000}>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
              © 2026 Energy Gym Management System - All Rights Reserved
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366f1' }}>
                Bahram Azizi
              </Typography>
              <IconButton
                component={Link}
                href="https://www.linkedin.com/in/bahramazizi1996"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: '#0077b5',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 119, 181, 0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Container>
        </Box>
      </Fade>

      {/* Change Password Dialog */}
      <ChangePassword
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Box>
  );
};

export default Layout;
