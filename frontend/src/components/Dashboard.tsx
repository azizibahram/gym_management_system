import { AttachMoney, CheckCircle, FitnessCenter, Groups, Inventory, NotificationsActive, Schedule, TrendingUp, Warning } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Chip, Container, Fade, Grow, LinearProgress, Paper, Slide, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
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
  photo: string | null;
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
  const [loaded, setLoaded] = useState(false);
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
    setTimeout(() => setLoaded(true), 100);
  }, []);

  if (!data) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress sx={{ 
          borderRadius: 2, 
          height: 6,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            borderRadius: 2,
          }
        }} />
        <Typography align="center" sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  const { stats, trends, distributions, alerts } = data;

  // Shelf Data for Pie Chart
  const shelfDist = [
    { name: 'Available', value: stats.shelves_available },
    { name: 'Assigned', value: stats.shelves_total - stats.shelves_available },
  ];

  const kpiCards = [
    {
      title: 'Total Members',
      value: stats.total,
      subtitle: 'All registered athletes',
      icon: <Groups sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      shadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
      delay: 100,
    },
    {
      title: 'Active Members',
      value: stats.active,
      subtitle: 'Currently active',
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      shadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
      delay: 200,
    },
    {
      title: 'Total Income',
      value: stats.income.toLocaleString(),
      subtitle: 'Revenue (AFN)',
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
      delay: 300,
    },
    {
      title: 'Urgent Alerts',
      value: alerts.length,
      subtitle: 'Need attention',
      icon: <Warning sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      shadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
      delay: 400,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 2 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Slide in={loaded} direction="down" timeout={500}>
          <Box sx={{
            textAlign: 'center',
            mb: 5,
            py: 4,
            px: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.5)',
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
              animation: 'gradientShift 5s ease infinite',
            },
          }}>
            <Typography
              variant="h3"
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
              Energy Gym Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
              Welcome back! Here's your gym overview
            </Typography>
            <Chip
              label={new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              sx={{
                fontSize: '0.95rem',
                py: 1,
                px: 2,
                borderRadius: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}
            />
          </Box>
        </Slide>

        {/* KPI Cards */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              color: '#1e293b',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                borderRadius: 2,
              }
            }}
          >
            Key Performance Indicators
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {kpiCards.map((card) => (
              <Box key={card.title} sx={{ flex: '1 1 280px', maxWidth: '350px' }}>
                <Grow in={loaded} timeout={500 + card.delay}>
                  <Card sx={{
                    background: card.gradient,
                    color: 'white',
                    borderRadius: 4,
                    boxShadow: card.shadow,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    minHeight: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: card.shadow.replace('0.3', '0.5'),
                    }
                  }}>
                    <CardContent sx={{ p: 4, textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <Avatar sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {card.value}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.95, mb: 0.5, fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {card.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Analytics Section */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              color: '#1e293b',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                borderRadius: 2,
              }
            }}
          >
            Analytics & Insights
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            alignItems: 'stretch'
          }}>
            {/* Revenue Trend */}
            <Box sx={{ flex: '1 1 600px', minWidth: { xs: '100%', md: '500px' } }}>
              <Fade in={loaded} timeout={800}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    p: 2.5,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(99,102,241,0.1)',
                  }}>
                    <Avatar sx={{ bgcolor: '#6366f1', mr: 3, width: 52, height: 52, boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                      <TrendingUp sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#6366f1' }}>
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
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickFormatter={(value) => `${value.toLocaleString()}`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(10px)',
                          }}
                          formatter={(value: number | undefined) => value ? [`${value.toLocaleString()} AFN`, 'Revenue'] : ['0 AFN', 'Revenue']}
                          labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#6366f1"
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
            <Box sx={{ flex: '1 1 400px', minWidth: { xs: '100%', md: '350px' } }}>
              <Fade in={loaded} timeout={1000}>
                <Paper sx={{
                  borderRadius: 4,
                  height: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Box sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 52, height: 52 }}>
                      <NotificationsActive sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Urgent Alerts
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
                      background: '#f1f5f9',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#cbd5e1',
                      borderRadius: '3px',
                      '&:hover': {
                        background: '#94a3b8',
                      },
                    },
                  }}>
                    {alerts.length > 0 ? (
                      <Table size="small">
                        <TableBody>
                          {alerts.map((alert, index) => (
                            <Grow in={true} timeout={300 + index * 100} key={alert.id}>
                              <TableRow hover sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'rgba(245, 158, 11, 0.05)',
                                  transform: 'scale(1.01)',
                                },
                                cursor: 'pointer',
                              }}>
                                <TableCell sx={{ py: 2.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                      src={alert.photo ? `http://localhost:8000${alert.photo}` : undefined}
                                      sx={{
                                        width: 44,
                                        height: 44,
                                        mr: 2,
                                        bgcolor: alert.photo ? 'transparent' : '#ef4444',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        border: '2px solid',
                                        borderColor: alert.days_left < 0 ? '#ef4444' : '#f59e0b',
                                      }}
                                    >
                                      {!alert.photo && alert.full_name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography fontWeight="bold" variant="body1" sx={{ mb: 0.5, color: '#1e293b' }}>
                                        {alert.full_name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                        {alert.contact_number}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                        {alert.gym_type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                  <Chip
                                    label={`${alert.days_left} day${alert.days_left !== 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{
                                      fontWeight: 'bold',
                                      background: alert.days_left < 0 
                                        ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' 
                                        : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                      color: 'white',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                      '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                      },
                                      transition: 'all 0.2s ease',
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            </Grow>
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
                        minHeight: 300,
                      }}>
                        <CheckCircle sx={{
                          fontSize: 64,
                          color: '#10b981',
                          mb: 3,
                          opacity: 0.8,
                        }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#10b981', mb: 1 }}>
                          All Clear!
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
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 700,
              color: '#1e293b',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                borderRadius: 2,
              }
            }}
          >
            Distribution Analytics
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center'
          }}>
            {/* Gym Type */}
            <Box sx={{ flex: '1 1 350px', maxWidth: '450px' }}>
              <Grow in={loaded} timeout={1200}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2.5,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(99,102,241,0.1)',
                  }}>
                    <Avatar sx={{ bgcolor: '#6366f1', mr: 3, width: 52, height: 52, boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                      <FitnessCenter sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#6366f1' }}>
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
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={3}
                        >
                          {distributions.type.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === 'Fitness' ? '#6366f1' : '#ec4899'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(10px)',
                          }}
                          formatter={(value: number | undefined) => value ? [`${value} athletes`, 'Count'] : ['0 athletes', 'Count']}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grow>
            </Box>

            {/* Gym Time */}
            <Box sx={{ flex: '1 1 350px', maxWidth: '450px' }}>
              <Grow in={loaded} timeout={1400}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2.5,
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.1) 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(245,158,11,0.1)',
                  }}>
                    <Avatar sx={{ bgcolor: '#f59e0b', mr: 3, width: 52, height: 52, boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
                      <Schedule sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#f59e0b' }}>
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
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={90}
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(10px)',
                          }}
                          formatter={(value: number | undefined) => value ? [`${value} athletes`, 'Count'] : ['0 athletes', 'Count']}
                        />
                        <Bar
                          dataKey="value"
                          fill="#10b981"
                          radius={[0, 10, 10, 0]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grow>
            </Box>

            {/* Shelf Distribution */}
            <Box sx={{ flex: '1 1 350px', maxWidth: '450px' }}>
              <Grow in={loaded} timeout={1600}>
                <Paper sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2.5,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.1) 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(16,185,129,0.1)',
                  }}>
                    <Avatar sx={{ bgcolor: '#10b981', mr: 3, width: 52, height: 52, boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                      <Inventory sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#10b981' }}>
                        Locker Usage
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available vs Assigned
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
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={3}
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#6366f1" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            background: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(10px)',
                          }}
                          formatter={(value: number | undefined) => value ? [`${value} lockers`, 'Count'] : ['0 lockers', 'Count']}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grow>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
