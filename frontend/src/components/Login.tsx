import { FitnessCenter, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Box, Button, Container, Fade, IconButton, InputAdornment, Link, TextField, Typography, Zoom } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-defined icon positions (avoiding impure Math.random during render)
  const iconPositions = [
    { top: '15%', left: '10%' },
    { top: '25%', left: '85%' },
    { top: '65%', left: '5%' },
    { top: '75%', left: '90%' },
    { top: '40%', left: '3%' },
    { top: '55%', left: '95%' },
    { top: '10%', left: '70%' },
    { top: '85%', left: '30%' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { username, password });
      login(response.data.access, response.data.refresh);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* Animated Background Shapes */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {/* Floating circles */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={`circle-${i}`}
            sx={{
              position: 'absolute',
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              borderRadius: '50%',
              background: `rgba(255, 255, 255, ${0.03 + i * 0.01})`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 12}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        
        {/* Floating gym icons */}
        {iconPositions.map((pos, i) => (
          <FitnessCenter
            key={i}
            sx={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              fontSize: 100 + i * 20,
              color: 'rgba(255,255,255,0.05)',
              animation: `floatIcon ${12 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Zoom in={true} timeout={600}>
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
              p: { xs: 3, sm: 5 },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1, #ec4899, #f59e0b, #10b981)',
                backgroundSize: '300% 100%',
                animation: 'gradientShift 3s ease infinite',
              },
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  mb: 3,
                  boxShadow: '0 15px 35px rgba(99, 102, 241, 0.4)',
                  animation: 'pulse 3s ease-in-out infinite',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                    zIndex: -1,
                    opacity: 0.5,
                    animation: 'spin 8s linear infinite',
                  },
                }}
              >
                <FitnessCenter sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                Energy Gym
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Admin Management System
              </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Fade in={!!error}>
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <Typography color="error" sx={{ fontWeight: 500, textAlign: 'center' }}>
                      {error}
                    </Typography>
                  </Box>
                </Fade>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#6366f1', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(99, 102, 241, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.04)',
                    },
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#6366f1', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#6366f1' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(99, 102, 241, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.04)',
                    },
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.8,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 15px 35px rgba(99, 102, 241, 0.5)',
                    transform: 'translateY(-2px)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Developer Credits */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid rgba(0,0,0,0.08)',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Designed and Developed by
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#6366f1' }}>
                  Bahram Azizi
                </Typography>
                <IconButton
                  component={Link}
                  href="https://www.linkedin.com/in/bahramazizi1996"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#0077b5',
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 119, 181, 0.1)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Zoom>
      </Container>

      {/* Keyframes */}
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(90deg); }
          50% { transform: translate(0, -40px) rotate(180deg); }
          75% { transform: translate(-20px, -20px) rotate(270deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 20px 45px rgba(99, 102, 241, 0.5); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default Login;
