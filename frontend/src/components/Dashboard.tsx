import { AttachMoney, CheckCircle, FitnessCenter, Groups, Inventory, NotificationsActive, Schedule, TrendingUp, Warning } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Chip, Container, Fade, LinearProgress, Paper, Table, TableBody, TableCell, TableRow, Typography, Zoom } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAlerts } from '../context/AlertsContext';

interface TrendData {
  name: string;
  amount: number;
}

interface DistData {
  name: string;
  value: number;
}

interface AlertData {
  id: number;
  full_name: string;
  days_left: number;
  gym_type: string;
  contact_number: string;
}

interface StatsData {
  stats: {
    total: number;
    active: number;
    inactive: number;
    income: number;
    shelves_total: number;
    shelves_available: number;
  };
  trends: {
    revenue: TrendData[];
  };
  distributions: {
    type: DistData[];
    time: DistData[];
    status: DistData[];
  };
  alerts: AlertData[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const { setAlerts } = useAlerts();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setAlerts(response.data.alerts);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!data) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading Dashboard...</Typography>
      </Box>
    );
  }

  const { stats, trends, distributions, alerts } = data;

  // Shelf Data for Pie Chart
  const shelfDist = [
    { name: 'Available', value: stats.shelves_available },
    { name: 'Assigned', value: stats.shelves_total - stats.shelves_available },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
    //   background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 6,
          py: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            🏋️‍♂️ Energy Gym Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Welcome back! Here's your gym overview
          </Typography>
          <Chip
            label={`Today: ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`}
            color="primary"
            variant="filled"
            sx={{
              fontSize: '1rem',
              py: 1,
              px: 2,
              borderRadius: 3,
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* KPI Cards */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              color: '#424242',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 2
              }
            }}
          >
            Key Performance Indicators
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!data} style={{ transitionDelay: '100ms' }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 16px 48px rgba(102, 126, 234, 0.4)',
                  }
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center', flex: 1 }}>
                    <Avatar sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}>
                      <Groups sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Total Members
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      All registered athletes in the system
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!data} style={{ transitionDelay: '200ms' }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
                  color: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(42, 245, 152, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 16px 48px rgba(42, 245, 152, 0.4)',
                  }
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center', flex: 1 }}>
                    <Avatar sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}>
                      <CheckCircle sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {stats.active}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Active Members
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Currently active gym members
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!data} style={{ transitionDelay: '300ms' }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  color: '#fff',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(255, 154, 158, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 16px 48px rgba(255, 154, 158, 0.4)',
                  }
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center', flex: 1 }}>
                    <Avatar sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}>
                      <AttachMoney sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {stats.income.toLocaleString()}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Total Income
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Revenue generated (AFN)
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!data} style={{ transitionDelay: '400ms' }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
                  color: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(255, 8, 68, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 16px 48px rgba(255, 8, 68, 0.4)',
                  }
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center', flex: 1 }}>
                    <Avatar sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}>
                      <Warning sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {alerts.length}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Urgent Alerts
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Members requiring attention
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          </Box>
        </Box>

        {/* Analytics Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              color: '#424242',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 2
              }
            }}
          >
            Analytics & Insights
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            alignItems: 'stretch'
          }}>
            {/* Revenue Trend */}
            <Box sx={{ flex: '1 1 600px', minWidth: '500px' }}>
              <Fade in={!!data} timeout={1000}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                    borderRadius: 3,
                    border: '1px solid #e3f2fd'
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 3, width: 48, height: 48 }}>
                      <TrendingUp sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Revenue Trend Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track your gym's financial performance over the last 6 months
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minHeight: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trends.revenue}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `${value.toLocaleString()}`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value: number | undefined) => value ? [`${value.toLocaleString()} AFN`, 'Revenue'] : ['0 AFN', 'Revenue']}
                          labelStyle={{ color: '#666', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#8884d8"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Fade>
            </Box>

            {/* Alerts List */}
            <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
              <Fade in={!!data} timeout={1200}>
                <Paper sx={{
                  borderRadius: 4,
                  height: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)',
                  border: '1px solid #ffe0b2',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{
                    p: 3,
                    bgcolor: 'warning.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(255,152,0,0.3)'
                  }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 48, height: 48 }}>
                      <NotificationsActive sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        ⚠️ Urgent Alerts
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {alerts.length} member{alerts.length !== 1 ? 's' : ''} need{alerts.length === 1 ? 's' : ''} attention
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    overflowY: 'auto',
                    flex: 1,
                    maxHeight: 400,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: '3px',
                      '&:hover': {
                        background: '#555',
                      },
                    },
                  }}>
                    {alerts.length > 0 ? (
                      <Table size="small">
                        <TableBody>
                          {alerts.map((alert, index) => (
                            <Fade in={!!data} timeout={1400 + index * 100} key={alert.id}>
                              <TableRow hover sx={{
                                '&:hover': {
                                  bgcolor: 'rgba(255,152,0,0.08)',
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease'
                                },
                                cursor: 'pointer'
                              }}>
                                <TableCell sx={{ py: 2.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      bgcolor: 'error.main',
                                      fontSize: '1rem',
                                      fontWeight: 'bold'
                                    }}>
                                      {alert.full_name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography fontWeight="bold" variant="body1" sx={{ mb: 0.5 }}>
                                        {alert.full_name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        📞 {alert.contact_number}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        🎯 {alert.gym_type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                  <Chip
                                    label={`${alert.days_left} day${alert.days_left !== 1 ? 's' : ''} left`}
                                    size="small"
                                    color="error"
                                    sx={{
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                                      '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            </Fade>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Box sx={{
                        p: 6,
                        textAlign: 'center',
                        color: 'text.secondary',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 300
                      }}>
                        <CheckCircle sx={{
                          fontSize: 64,
                          color: 'success.light',
                          mb: 3,
                          opacity: 0.8
                        }} />
                        <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                          🎉 All Clear!
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          No urgent alerts at this time.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Great job keeping your gym running smoothly!
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Fade>
            </Box>
          </Box>
        </Box>

        {/* Distribution Analytics */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              color: '#424242',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 2
              }
            }}
          >
            Distribution Analytics
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center'
          }}>
            {/* Gym Type */}
            <Box sx={{ flex: '1 1 350px', maxWidth: '400px' }}>
              <Fade in={!!data} timeout={2000}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    borderRadius: 3,
                    border: '1px solid #e1f5fe'
                  }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 3, width: 48, height: 48 }}>
                      <FitnessCenter sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="info.main">
                        Membership Types
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distribution by gym category
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={distributions.type}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={3}
                        >
                          {distributions.type.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Fitness' ? '#0088FE' : '#FF8042'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value: number | undefined) => value ? [`${value} athletes`, 'Count'] : ['0 athletes', 'Count']}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Fade>
            </Box>

            {/* Gym Time */}
            <Box sx={{ flex: '1 1 350px', maxWidth: '400px' }}>
              <Fade in={!!data} timeout={2200}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2,
                    background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
                    borderRadius: 3,
                    border: '1px solid #ffe0b2'
                  }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 3, width: 48, height: 48 }}>
                      <Schedule sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        Time Slot Preferences
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Popular training times
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={distributions.time} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis
                          type="number"
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={90}
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value: number | undefined) => value ? [`${value} athletes`, 'Count'] : ['0 athletes', 'Count']}
                        />
                        <Bar
                          dataKey="value"
                          fill="#82ca9d"
                          radius={[0, 10, 10, 0]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Fade>
            </Box>

            {/* Shelf Management */}
            <Box sx={{ flex: '1 1 350px', maxWidth: '400px' }}>
              <Fade in={!!data} timeout={2400}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2,
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%)',
                    borderRadius: 3,
                    border: '1px solid #c8e6c9'
                  }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 3, width: 48, height: 48 }}>
                      <Inventory sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        Locker Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Storage utilization status
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={shelfDist}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          stroke="#fff"
                          strokeWidth={3}
                        >
                          <Cell fill="#4caf50" /> {/* Available */}
                          <Cell fill="#ff9800" /> {/* Assigned */}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value: number | undefined) => value ? [`${value} shelves`, 'Count'] : ['0 shelves', 'Count']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Fade>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;