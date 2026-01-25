import { AttachMoney, CheckCircle, FitnessCenter, Groups, Inventory, NotificationsActive, Schedule, TrendingUp, Warning } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Container, LinearProgress, Paper, Table, TableBody, TableCell, TableRow, Typography, Avatar, Fade, Zoom } from '@mui/material';
import { Grid } from '@mui/system';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
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
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>
          Dashboard Overview
        </Typography>
        <Chip label={new Date().toLocaleDateString()} color="primary" variant="outlined" />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={!!data} style={{ transitionDelay: '100ms' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(102, 126, 234, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{stats.total}</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>Total Members</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>All registered athletes</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Groups sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={!!data} style={{ transitionDelay: '200ms' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
              color: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(42, 245, 152, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(42, 245, 152, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{stats.active}</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>Active Members</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Currently active</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <CheckCircle sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={!!data} style={{ transitionDelay: '300ms' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              color: '#fff',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(255, 154, 158, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(255, 154, 158, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>{stats.income.toLocaleString()}</Typography>
                    <Typography variant="body1" sx={{ color: 'white', opacity: 0.9, fontSize: '0.9rem' }}>Total Income</Typography>
                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>AFN</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={!!data} style={{ transitionDelay: '400ms' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
              color: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(255, 8, 68, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(255, 8, 68, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{alerts.length}</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>Urgent Alerts</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Require attention</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Warning sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Fade in={!!data} timeout={1000}>
            <Paper sx={{
              p: 4,
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Revenue Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 6 months performance
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
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
            </Paper>
          </Fade>
        </Grid>

        {/* Alerts List */}
        <Grid item xs={12} lg={4}>
          <Fade in={!!data} timeout={1200}>
            <Paper sx={{
              p: 0,
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
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <NotificationsActive />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Urgent Alerts
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {alerts.length} athletes need attention
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 330, flex: 1 }}>
                {alerts.length > 0 ? (
                  <Table size="small">
                    <TableBody>
                      {alerts.map((alert, index) => (
                        <Fade in={!!data} timeout={1400 + index * 100} key={alert.id}>
                          <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(255,152,0,0.08)' } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'error.main' }}>
                                  {alert.full_name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight="bold" variant="body2">
                                    {alert.full_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {alert.contact_number}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${alert.days_left} Days`}
                                size="small"
                                color="error"
                                sx={{
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                                  '&:hover': { transform: 'scale(1.05)' }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        </Fade>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.light', mb: 2 }} />
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      All Clear!
                    </Typography>
                    <Typography>No urgent alerts. Great job!</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Distributions Row */}
      <Grid container spacing={3}>
        {/* Gym Type */}
        <Grid item xs={12} md={4}>
          <Fade in={!!data} timeout={2000}>
            <Paper sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <FitnessCenter />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  Membership Type
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distributions.type}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
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
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Gym Time */}
        <Grid item xs={12} md={4}>
          <Fade in={!!data} timeout={2200}>
            <Paper sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  Time Slots
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={250}>
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
                    width={80}
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
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Shelf Utilization */}
        <Grid item xs={12} md={4}>
          <Fade in={!!data} timeout={2400}>
            <Paper sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e9ecef'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Inventory />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  Shelf Utilization
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={shelfDist}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    stroke="#fff"
                    strokeWidth={2}
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
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;