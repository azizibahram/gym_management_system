import { AccessTime, AccountBox, Add, ArrowDownward, ArrowUpward, AttachMoney, CalendarToday, Cancel, CheckCircle, CreditCard, Delete, Edit, FilterList, FitnessCenter, History, Notes as NotesIcon, Person, Phone, Search, Storage, ToggleOff, ToggleOn, VerifiedUser, Warning } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, FormControl, Grid, Grow, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import PhotoUploader from './PhotoUploader';

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  payment_type: 'registration' | 'renewal';
  notes: string;
}

interface Athlete {
  id: number;
  full_name: string;
  father_name: string;
  photo: string | null;
  registration_date: string;
  fee_deadline_date: string;
  gym_type: string;
  gym_time: string;
  discount: number;
  final_fee: number;
  contact_number: string;
  notes: string;
  shelf: number | null;
  days_left: number;
  is_active: boolean;
  payments: Payment[];
}

interface Shelf {
  id: number;
  shelf_number: string;
  status: string;
}

const Athletes: React.FC = () => {
  const location = useLocation();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignAthlete, setReassignAthlete] = useState<Athlete | null>(null);
  const [newShelfId, setNewShelfId] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    father_name: '',
    photo: null as File | null,
    gym_type: 'fitness',
    gym_time: 'morning',
    discount: 0,
    contact_number: '',
    notes: '',
    shelf: '',
    fee_deadline_date: '',
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGymType, setFilterGymType] = useState('');
  const [filterGymTime, setFilterGymTime] = useState('');
  const [filterFeeStatus, setFilterFeeStatus] = useState('');

  // Sorting states
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Renewal & Profile State
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewAthlete, setRenewAthlete] = useState<Athlete | null>(null);
  const [renewDuration, setRenewDuration] = useState(30);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAthlete, setProfileAthlete] = useState<Athlete | null>(null);
  const [hasOpenedProfile, setHasOpenedProfile] = useState(false);

  const fetchAthletes = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (filterGymType) params.append('gym_type', filterGymType);
      if (filterGymTime) params.append('gym_time', filterGymTime);
      if (filterFeeStatus) params.append('fee_status', filterFeeStatus);

      const response = await axios.get(`http://localhost:8000/api/athletes/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAthletes(Array.isArray(response.data) ? response.data : (response.data.results || []));
    } catch (error) {
      console.error('Error fetching athletes:', error);
      setAthletes([]);
    }
  };

  const fetchShelves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/shelves/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShelves(Array.isArray(response.data) ? response.data : (response.data.results || []));
    } catch (error) {
      console.error('Error fetching shelves:', error);
      setShelves([]);
    }
  };

  const openProfile = (athlete: Athlete) => {
    setProfileAthlete(athlete);
    setProfileOpen(true);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAthletes();
      await fetchShelves();
    };
    loadData();
    setTimeout(() => setLoaded(true), 100);
  }, [searchQuery, filterGymType, filterGymTime, filterFeeStatus]);

  // Check for profile to open from navigation state
  useEffect(() => {
    const openProfileId = location.state?.openProfileId;
    if (openProfileId && athletes.length > 0 && !hasOpenedProfile) {
      const athlete = athletes.find(a => a.id === openProfileId);
      if (athlete) {
        // Use requestAnimationFrame to avoid synchronous setState
        requestAnimationFrame(() => {
          setProfileAthlete(athlete);
          setProfileOpen(true);
          setHasOpenedProfile(true);
        });
        // Clear the state to prevent re-opening on data updates
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, athletes, hasOpenedProfile]);

  const calculateFee = (type: string, discount: number) => {
    const base = type === 'fitness' ? 1000 : 700;
    return base - discount;
  };

  const openRenewDialog = (e: React.MouseEvent, athlete: Athlete) => {
    e.stopPropagation();
    setRenewAthlete(athlete);
    setRenewDuration(30);
    setRenewOpen(true);
  };

  const submitRenew = async () => {
    if (!renewAthlete) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:8000/api/athletes/${renewAthlete.id}/renew/`, {
        duration: renewDuration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Membership renewed for "${renewAthlete.full_name}" (${renewDuration} days)!`);
      setRenewOpen(false);
      fetchAthletes();
    } catch (error) {
      toast.error('Failed to renew membership. Please try again.');
      console.error('Error renewing membership:', error);
    }
  };

  const handleToggleStatus = async (athlete: Athlete) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:8000/api/athletes/${athlete.id}/toggle_status/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newStatus = athlete.is_active ? 'deactivated' : 'activated';
      toast.success(`Athlete "${athlete.full_name}" ${newStatus} successfully!`);
      fetchAthletes();
    } catch (error) {
      toast.error('Failed to update athlete status. Please try again.');
      console.error('Error toggling status:', error);
    }
  };

  const handleReassignShelf = (athlete: Athlete) => {
    setReassignAthlete(athlete);
    setNewShelfId(athlete.shelf ? athlete.shelf.toString() : '');
    setReassignOpen(true);
  };

  const handleReassignSubmit = async () => {
    if (!reassignAthlete) return;
    const token = localStorage.getItem('token');
    const data = new FormData();

    // Copy existing athlete data
    data.append('full_name', reassignAthlete.full_name);
    data.append('father_name', reassignAthlete.father_name);
    data.append('gym_type', reassignAthlete.gym_type);
    data.append('gym_time', reassignAthlete.gym_time);
    data.append('discount', reassignAthlete.discount.toString());
    data.append('contact_number', reassignAthlete.contact_number);
    data.append('notes', reassignAthlete.notes);

    // Update shelf
    if (newShelfId) {
      data.append('shelf', newShelfId);
    }

    try {
      await axios.put(`http://localhost:8000/api/athletes/${reassignAthlete.id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Shelf reassigned for "${reassignAthlete.full_name}" successfully!`);
      setReassignOpen(false);
      setReassignAthlete(null);
      fetchAthletes();
      fetchShelves();
    } catch (error) {
      toast.error('Failed to reassign shelf. Please try again.');
      console.error('Error reassigning shelf:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterGymType('');
    setFilterGymTime('');
    setFilterFeeStatus('');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />;
  };

  const sortedAthletes = useMemo<Athlete[]>(() => {
    return [...athletes].sort((a, b) => {
      let aVal: string | number | Date, bVal: string | number | Date;
      switch (sortField) {
        case 'fullName':
          aVal = a.full_name;
          bVal = b.full_name;
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'gymType':
          aVal = a.gym_type;
          bVal = b.gym_type;
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'gymTime':
          aVal = a.gym_time;
          bVal = b.gym_time;
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'regDate':
          aVal = new Date(a.registration_date);
          bVal = new Date(b.registration_date);
          return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
        case 'feeDeadline':
          aVal = new Date(a.fee_deadline_date);
          bVal = new Date(b.fee_deadline_date);
          return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
        case 'daysLeft':
          aVal = a.days_left;
          bVal = b.days_left;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        case 'shelf':
          if (a.shelf === null && b.shelf === null) return 0;
          if (a.shelf === null) return sortDirection === 'asc' ? 1 : -1;
          if (b.shelf === null) return sortDirection === 'asc' ? -1 : 1;
          return sortDirection === 'asc' ? a.shelf - b.shelf : b.shelf - a.shelf;
        default:
          return 0;
      }
    });
  }, [athletes, sortField, sortDirection]);

  const activeFiltersCount = [filterGymType, filterGymTime, filterFeeStatus].filter(f => f).length;

  // Calculate badge counts
  const criticalCount = athletes.filter(a => a.days_left <= 3 && a.days_left >= 0).length;
  const overdueCount = athletes.filter(a => a.days_left < 0).length;

  const handleOpen = (athlete?: Athlete) => {
    if (athlete) {
      setEditing(athlete);
      setForm({
        full_name: athlete.full_name,
        father_name: athlete.father_name,
        photo: null,
        gym_type: athlete.gym_type,
        gym_time: athlete.gym_time,
        discount: athlete.discount,
        contact_number: athlete.contact_number,
        notes: athlete.notes,
        shelf: athlete.shelf ? athlete.shelf.toString() : '',
        fee_deadline_date: athlete.fee_deadline_date || '',
      });
    } else {
      setEditing(null);
      setForm({
        full_name: '',
        father_name: '',
        photo: null,
        gym_type: 'fitness',
        gym_time: 'morning',
        discount: 0,
        contact_number: '',
        notes: '',
        shelf: '',
        fee_deadline_date: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('full_name', form.full_name);
    data.append('father_name', form.father_name);
    if (form.photo) data.append('photo', form.photo);
    data.append('gym_type', form.gym_type);
    data.append('gym_time', form.gym_time);
    data.append('discount', form.discount.toString());
    data.append('contact_number', form.contact_number);
    data.append('notes', form.notes);
    if (form.shelf) data.append('shelf', form.shelf);
    if (form.fee_deadline_date) data.append('fee_deadline_date', form.fee_deadline_date);

    try {
      if (editing) {
        await axios.put(`http://localhost:8000/api/athletes/${editing.id}/`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Athlete "${form.full_name}" updated successfully!`);
      } else {
        await axios.post('http://localhost:8000/api/athletes/', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Athlete "${form.full_name}" registered successfully!`);
      }
      handleClose();
      fetchAthletes();
    } catch (error) {
      toast.error('Failed to save athlete. Please try again.');
      console.error('Error saving athlete:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:8000/api/athletes/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Athlete deleted successfully!');
        fetchAthletes();
      } catch (error) {
        toast.error('Failed to delete athlete. Please try again.');
        console.error('Error deleting athlete:', error);
      }
    }
  };

  const getStatusChip = (days: number) => {
    if (days < 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Chip
            label="Overdue"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
            }}
          />
          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, fontSize: '0.7rem' }}>
            {Math.abs(days)} days ago
          </Typography>
        </Box>
      );
    } else if (days <= 5) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Chip
            label="Critical"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            }}
          />
          <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }}>
            {days} days left
          </Typography>
        </Box>
      );
    } else if (days <= 15) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Chip
            label="Warning"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}
          />
          <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.7rem' }}>
            {days} days left
          </Typography>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Chip
          label="Active"
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        />
        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.7rem' }}>
          {days} days left
        </Typography>
      </Box>
    );
  };

  const kpiCards = [
    {
      title: 'Active Members',
      value: athletes.filter(a => a.is_active).length,
      subtitle: 'Currently active',
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      shadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
      delay: 100,
    },
    {
      title: 'Critical Alerts',
      value: criticalCount,
      subtitle: 'Need attention',
      icon: <Warning sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
      delay: 200,
    },
    {
      title: 'Overdue',
      value: overdueCount,
      subtitle: 'Expired fees',
      icon: <Cancel sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      shadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
      delay: 300,
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
              Athletics Management
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
              Manage your gym members and their information
            </Typography>
            <Chip
              label={`Total Members: ${athletes.length}`}
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
            Member Statistics
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
                    minHeight: 160,
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
                    <CardContent sx={{ p: 3.5, textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <Avatar sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
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

        {/* Search and Filter Section */}
        <Fade in={loaded} timeout={800}>
          <Paper sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField
                label="Search athletes"
                placeholder="Search by name, father name, or contact"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  flex: 1,
                  minWidth: 280,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#6366f1' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => handleOpen()}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 12px 35px rgba(99, 102, 241, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Register Athlete
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6366f1' }}>
                <FilterList />
                <Typography variant="subtitle2" fontWeight={700}>Filters:</Typography>
              </Box>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel size="small">Gym Type</InputLabel>
                <Select 
                  value={filterGymType} 
                  onChange={(e) => setFilterGymType(e.target.value)} 
                  label="Gym Type"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="fitness">Fitness</MenuItem>
                  <MenuItem value="bodybuilding">Bodybuilding</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel size="small">Gym Time</InputLabel>
                <Select 
                  value={filterGymTime} 
                  onChange={(e) => setFilterGymTime(e.target.value)} 
                  label="Gym Time"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="night">Night</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel size="small">Fee Status</InputLabel>
                <Select 
                  value={filterFeeStatus} 
                  onChange={(e) => setFilterFeeStatus(e.target.value)} 
                  label="Fee Status"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="safe">Safe (16+ days)</MenuItem>
                  <MenuItem value="warning">Warning (6-15 days)</MenuItem>
                  <MenuItem value="critical">Critical (1-5 days)</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderColor: '#4f46e5',
                    },
                  }}
                >
                  Clear Filters ({activeFiltersCount})
                </Button>
              )}
            </Box>
          </Paper>
        </Fade>

        {/* Athletes Table */}
        <Fade in={loaded} timeout={1000}>
          <Paper sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight={700} color="#1e293b">
                Athletes List
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {athletes.length} athlete{athletes.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>Photo</TableCell>
                    <TableCell onClick={() => handleSort('fullName')} sx={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', '&:hover': { color: '#6366f1' } }}>
                      Full Name {getSortIcon('fullName')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('gymType')} sx={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', '&:hover': { color: '#6366f1' } }}>
                      Gym Type {getSortIcon('gymType')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('gymTime')} sx={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', '&:hover': { color: '#6366f1' } }}>
                      Gym Time {getSortIcon('gymTime')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('shelf')} sx={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', '&:hover': { color: '#6366f1' } }}>
                      Locker {getSortIcon('shelf')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('feeDeadline')} sx={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', '&:hover': { color: '#6366f1' } }}>
                      Fee Deadline {getSortIcon('feeDeadline')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('daysLeft')} sx={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', '&:hover': { color: '#6366f1' } }}>
                      Status {getSortIcon('daysLeft')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAthletes.map((athlete, index) => (
                    <Grow in={true} timeout={300 + index * 50} key={athlete.id}>
                      <TableRow
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            backgroundColor: 'rgba(99, 102, 241, 0.04)',
                            transform: 'scale(1.005)',
                          }
                        }}
                        onClick={() => openProfile(athlete)}
                      >
                        <TableCell>
                          <Avatar
                            src={athlete.photo ? (athlete.photo.startsWith('http') ? athlete.photo : `http://localhost:8000${athlete.photo}`) : undefined}
                            alt={athlete.full_name}
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              border: '3px solid white', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              }
                            }}
                          >
                            {!athlete.photo && <Person />}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700} color="#1e293b">{athlete.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{athlete.contact_number}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={athlete.gym_type} 
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              background: athlete.gym_type === 'fitness' 
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                                : 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                              color: 'white',
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={athlete.gym_time} 
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              background: 'rgba(99, 102, 241, 0.1)',
                              color: '#6366f1',
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          {athlete.shelf ? (
                            <Chip 
                              label={shelves.find(s => s.id === Number(athlete.shelf))?.shelf_number || athlete.shelf}
                              size="small"
                              sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                color: 'white',
                              }} 
                            />
                          ) : (
                            <Typography color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{athlete.fee_deadline_date}</Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(athlete.days_left)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                            <Tooltip title={athlete.is_active ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(athlete); }}
                                sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}
                              >
                                {athlete.is_active ? <ToggleOn color="success" fontSize="large" /> : <ToggleOff color="action" fontSize="large" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={(e) => { e.stopPropagation(); handleOpen(athlete); }}
                                sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Renew Membership">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={(e) => openRenewDialog(e, athlete)}
                                sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}
                              >
                                <CreditCard />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reassign Locker">
                              <IconButton 
                                size="small" 
                                color="info" 
                                onClick={(e) => { e.stopPropagation(); handleReassignShelf(athlete); }}
                                sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}
                              >
                                <Storage />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={(e) => { e.stopPropagation(); handleDelete(athlete.id); }}
                                sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Grow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            fontWeight: 700,
            py: 3,
          }}>
            {editing ? 'Edit Athlete' : 'Register New Athlete'}
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2 }}>
            <Grid container spacing={4}>
              {/* Left Column - Personal Info */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                  <PhotoUploader
                    onPhotoChange={(file) => setForm({ ...form, photo: file })}
                    currentPhoto={editing?.photo}
                  />
                </Box>

                <TextField
                  label="Full Name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Father Name"
                  value={form.father_name}
                  onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Contact Number"
                  value={form.contact_number}
                  onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Right Column - Gym Details */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle1" sx={{ mb: 3, color: '#6366f1', fontWeight: 700, borderBottom: '2px solid #e0e7ff', pb: 1 }}>
                  MEMBERSHIP DETAILS
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Gym Type</InputLabel>
                      <Select
                        value={form.gym_type}
                        label="Gym Type"
                        onChange={(e) => setForm({ ...form, gym_type: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <FitnessCenter sx={{ color: '#6366f1', mr: 1 }} />
                          </InputAdornment>
                        }
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value="fitness">Fitness</MenuItem>
                        <MenuItem value="bodybuilding">Bodybuilding</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Gym Time</InputLabel>
                      <Select
                        value={form.gym_time}
                        label="Gym Time"
                        onChange={(e) => setForm({ ...form, gym_time: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <AccessTime sx={{ color: '#6366f1', mr: 1 }} />
                          </InputAdornment>
                        }
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value="morning">Morning</MenuItem>
                        <MenuItem value="afternoon">Afternoon</MenuItem>
                        <MenuItem value="night">Night</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Discount"
                      type="number"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: '#6366f1' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Final Fee"
                      value={calculateFee(form.gym_type, form.discount)}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: '#6366f1' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Fee Deadline (Optional)"
                  type="date"
                  value={form.fee_deadline_date}
                  onChange={(e) => setForm({ ...form, fee_deadline_date: e.target.value })}
                  fullWidth
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  InputLabelProps={{ shrink: true }}
                  helperText="Defaults to 30 days from today"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Assigned Locker</InputLabel>
                  <Select
                    value={form.shelf}
                    label="Assigned Locker"
                    onChange={(e) => setForm({ ...form, shelf: e.target.value })}
                    startAdornment={
                      <InputAdornment position="start">
                        <Storage sx={{ color: '#6366f1', mr: 1 }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2.5 }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {shelves && Array.isArray(shelves) && shelves.filter(s => s.status === 'available' || s.id.toString() === form.shelf).map(shelf => (
                      <MenuItem key={shelf.id} value={String(shelf.id)}>{shelf.shelf_number}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotesIcon sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4 }}>
            <Button 
              onClick={handleClose}
              sx={{
                color: '#64748b',
                fontWeight: 600,
                '&:hover': { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 2.5,
                px: 4,
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              {editing ? 'Update' : 'Register'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Shelf Reassignment Dialog */}
        <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            fontWeight: 700,
            py: 3,
          }}>
            Reassign Locker for {reassignAthlete?.full_name}
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select New Locker</InputLabel>
              <Select
                value={newShelfId}
                onChange={(e) => setNewShelfId(e.target.value)}
                label="Select New Locker"
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value=""><em>No Locker</em></MenuItem>
                {shelves.filter(s => s.status === 'available' || s.id.toString() === newShelfId).map(shelf => (
                  <MenuItem key={shelf.id} value={shelf.id}>
                    Locker {shelf.shelf_number} - {shelf.status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Current locker: {reassignAthlete?.shelf ? `Locker ${reassignAthlete.shelf}` : 'None'}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4 }}>
            <Button 
              onClick={() => setReassignOpen(false)}
              sx={{
                color: '#64748b',
                fontWeight: 600,
                '&:hover': { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReassignSubmit} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 2.5,
                px: 4,
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              Reassign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Renewal Dialog */}
        <Dialog open={renewOpen} onClose={() => setRenewOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            fontWeight: 700,
            py: 3,
          }}>
            Renew Membership
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2, minWidth: 350 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Renew membership for <strong>{renewAthlete?.full_name}</strong>?
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Duration</InputLabel>
              <Select
                value={renewDuration}
                label="Duration"
                onChange={(e) => setRenewDuration(Number(e.target.value))}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value={30}>1 Month (30 Days)</MenuItem>
                <MenuItem value={60}>2 Months (60 Days)</MenuItem>
                <MenuItem value={90}>3 Months (90 Days)</MenuItem>
                <MenuItem value={180}>6 Months (180 Days)</MenuItem>
                <MenuItem value={365}>1 Year (365 Days)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4 }}>
            <Button 
              onClick={() => setRenewOpen(false)}
              sx={{
                color: '#64748b',
                fontWeight: 600,
                '&:hover': { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitRenew} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                borderRadius: 2.5,
                px: 4,
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                },
              }}
            >
              Confirm Renewal
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            py: 3,
          }}>
            Athlete Profile
          </DialogTitle>
          <DialogContent sx={{ pt: 0, pb: 4, bgcolor: '#f8fafc' }}>
            {profileAthlete && (
              <Box>
                {/* Header Card */}
                <Paper elevation={0} sx={{
                  p: 3,
                  mb: 3,
                  mt: 3,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #fff 0%, #f0f4ff 100%)',
                  border: '1px solid #e3e8ee',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}>
                  <Avatar
                    src={profileAthlete.photo ? (profileAthlete.photo.startsWith('http') ? profileAthlete.photo : `http://localhost:8000${profileAthlete.photo}`) : undefined}
                    sx={{ width: 90, height: 90, mr: 3, border: '4px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{profileAthlete.full_name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={profileAthlete.is_active ? "Active Member" : "Inactive"}
                        color={profileAthlete.is_active ? "success" : "default"}
                        icon={profileAthlete.is_active ? <CheckCircle /> : <Cancel />}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {getStatusChip(profileAthlete.days_left)}
                    </Box>
                  </Box>
                </Paper>

                <Grid container spacing={3}>
                  {/* Personal Info Card */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#6366f1', fontWeight: 700 }}>
                          <AccountBox /> Personal Details
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Contact</Typography>
                            <Typography variant="body2" fontWeight={700}>{profileAthlete.contact_number || 'N/A'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Father Name</Typography>
                            <Typography variant="body2" fontWeight={700}>{profileAthlete.father_name || 'N/A'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Gym Type</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{profileAthlete.gym_type}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Assigned Locker</Typography>
                            <Chip
                              label={profileAthlete.shelf ? `Locker ${shelves.find(s => s.id === Number(profileAthlete.shelf))?.shelf_number || profileAthlete.shelf}` : 'None'}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                        {profileAthlete.notes && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">Notes</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'pre-wrap' }}>{profileAthlete.notes}</Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Membership Status Card */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#6366f1', fontWeight: 700 }}>
                          <VerifiedUser /> Current Status
                        </Typography>
                        <Box sx={{ 
                          bgcolor: profileAthlete.days_left < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                          p: 2.5, 
                          borderRadius: 2, 
                          mb: 2,
                          border: '1px solid',
                          borderColor: profileAthlete.days_left < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: profileAthlete.days_left < 0 ? '#ef4444' : '#10b981' }}>
                            {profileAthlete.days_left < 0
                              ? `${Math.abs(profileAthlete.days_left)} Days Overdue`
                              : `${profileAthlete.days_left} Days Remaining`}
                          </Typography>
                          <Typography variant="body2" display="block" color="text.secondary">
                            Deadline: {profileAthlete.fee_deadline_date}
                          </Typography>
                        </Box>
                        {profileAthlete.days_left < 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f59e0b', p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
                            <AttachMoney />
                            <Typography variant="body2" fontWeight={700}>
                              Est. Debt: ${(Math.ceil(Math.abs(profileAthlete.days_left) / 30) * Number(profileAthlete.final_fee)).toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Payment History Table */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#6366f1', fontWeight: 700 }}>
                  <History /> Payment History
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {profileAthlete.payments && profileAthlete.payments.length > 0 ? (
                        profileAthlete.payments.map((payment) => (
                          <TableRow key={payment.id} hover>
                            <TableCell>{payment.payment_date}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>
                              <Chip
                                label={payment.payment_type}
                                size="small"
                                color={payment.payment_type === 'renewal' ? 'success' : 'primary'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>${payment.amount}</TableCell>
                            <TableCell>{payment.notes}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No payment history found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4, bgcolor: '#f8fafc' }}>
            <Button 
              onClick={() => setProfileOpen(false)}
              sx={{
                color: '#64748b',
                fontWeight: 600,
                '&:hover': { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setProfileOpen(false);
                if (profileAthlete) {
                  setRenewAthlete(profileAthlete);
                  setRenewDuration(30);
                  setRenewOpen(true);
                }
              }}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 2.5,
                px: 4,
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              Renew Membership
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Athletes;
