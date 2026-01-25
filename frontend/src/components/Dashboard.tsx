import { AttachMoney, CheckCircle, Groups, NotificationsActive, TrendingUp, Warning } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Container, Grid, LinearProgress, Paper, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = ['#4caf50', '#bdbdbd']; // Active (Green), Inactive (Grey)

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
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Total Members</Typography>
                </Box>
                <Groups sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', color: 'white', borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats.active}</Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Active Members</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', color: '#fff', borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>{stats.income.toLocaleString()}</Typography>
                  <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>Total Income (AFN)</Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', color: 'white', borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{alerts.length}</Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Urgent Alerts</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 3, height: '100%', boxShadow: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Revenue Trend (Last 6 Months)</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends.revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} AFN`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Alerts List */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 0, borderRadius: 3, height: '100%', overflow: 'hidden', boxShadow: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, bgcolor: '#fff3e0', display: 'flex', alignItems: 'center' }}>
              <NotificationsActive color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="warning.main">Urgent Alerts</Typography>
            </Box>
            <Box sx={{ overflowY: 'auto', maxHeight: 330, flex: 1 }}>
              {alerts.length > 0 ? (
                <Table size="small">
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id} hover>
                        <TableCell>
                          <Typography fontWeight="bold">{alert.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{alert.contact_number}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${alert.days_left} Days`}
                            size="small"
                            color="error"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.light', mb: 1 }} />
                  <Typography>No urgent alerts! Great job.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Distributions Row */}
      <Grid container spacing={3}>
        {/* Gym Type */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom align="center">Membership Type</Typography>
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
                >
                  {distributions.type.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Fitness' ? '#0088FE' : '#FF8042'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gym Time */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom align="center">Time Slots</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributions.time} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Shelf Utilization */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom align="center">Shelf Utilization</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={shelfDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#4caf50" /> {/* Available */}
                  <Cell fill="#ff9800" /> {/* Assigned */}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;