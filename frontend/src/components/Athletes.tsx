import { Add, Cancel, CheckCircle, FilterList, Search, Warning } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, FormControl, Grow, InputAdornment, InputLabel, MenuItem, Paper, Select, Slide, TextField, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import AthleteCard, { GRID_GAP } from './AthleteCard';
import AthleteCardSkeleton from './AthleteCardSkeleton';
import AthleteProfile from './AthleteProfile';
import AthleteRegistrationModal from './AthleteRegistrationModal';
import { useInfiniteAthletes, useToggleAthleteStatus, useRenewAthlete, useDeleteAthlete, type Athlete } from '../hooks/useAthletes';
import { useDebounce } from '../hooks/useDebounce';

interface Shelf {
  id: number;
  shelf_number: string;
  status: string;
  locker_duration_months?: number;
  locker_price?: number;
  locker_end_date?: string;
  locker_start_date?: string;
}

const dialogPaperSx = {
  borderRadius: 4,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
};

const dialogTitlePurpleSx = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: 'white',
  fontWeight: 700,
  py: 3,
};

const dialogTitleGreenSx = {
  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  color: 'white',
  fontWeight: 700,
  py: 3,
};

const buttonSecondarySx = {
  color: '#64748b',
  fontWeight: 600,
  '&:hover': { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
};

const buttonPrimaryPurpleSx = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  borderRadius: 2.5,
  px: 4,
  fontWeight: 700,
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
  },
};

const buttonPrimaryGreenSx = {
  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  borderRadius: 2.5,
  px: 4,
  fontWeight: 700,
  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
  },
};

const headerContainerSx = {
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
};


const Athletes: React.FC = () => {
  const location = useLocation();
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignAthlete, setReassignAthlete] = useState<Athlete | null>(null);
  const [newShelfId, setNewShelfId] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Ref for infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGymType, setFilterGymType] = useState('');
  const [filterGymTime, setFilterGymTime] = useState('');
  const [filterFeeStatus, setFilterFeeStatus] = useState('');

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Sorting states
  const [sortField] = useState<string>('');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');

  // Renewal & Profile State
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewAthlete, setRenewAthlete] = useState<Athlete | null>(null);
  const [renewDuration, setRenewDuration] = useState(30);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAthlete, setProfileAthlete] = useState<Athlete | null>(null);
  const [hasOpenedProfile, setHasOpenedProfile] = useState(false);

  // React Query hooks - using infinite scroll
  const { 
    data, 
    isLoading: loading, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: fetchAthletes 
  } = useInfiniteAthletes({
    search: debouncedSearchQuery,
    gym_type: filterGymType,
    gym_time: filterGymTime,
    fee_status: filterFeeStatus,
  });

  // Flatten all pages into single array
  const athletes = useMemo(() => {
    return data?.pages.flatMap(page => page.results) || [];
  }, [data]);

  // Get total count from first page
  const totalCount = data?.pages[0]?.count || 0;

  const toggleStatusMutation = useToggleAthleteStatus();
  const renewMutation = useRenewAthlete();
  const deleteMutation = useDeleteAthlete();

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  // Load static data once on mount
  useEffect(() => {
    fetchShelves();
    const timeoutId = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeoutId);
  }, []);

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

  const openRenewDialog = (e: React.MouseEvent, athlete: Athlete) => {
    e.stopPropagation();
    setRenewAthlete(athlete);
    setRenewDuration(30);
    setRenewOpen(true);
  };

  const submitRenew = async () => {
    if (!renewAthlete) return;
    
    try {
      await renewMutation.mutateAsync({
        id: renewAthlete.id,
        duration: renewDuration
      });

      toast.success(`Membership renewed for "${renewAthlete.full_name}" (${renewDuration} days)!`);
      setRenewOpen(false);
    } catch (error) {
      toast.error('Failed to renew membership. Please try again.');
      console.error('Error renewing membership:', error);
    }
  };

  const handleToggleStatus = async (athlete: Athlete) => {
    try {
      await toggleStatusMutation.mutateAsync(athlete.id);
      const newStatus = athlete.is_active ? 'deactivated' : 'activated';
      toast.success(`Athlete "${athlete.full_name}" ${newStatus} successfully!`);
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

  // Calculate badge counts (memoized)
  const { activeCount, criticalCount, overdueCount } = useMemo(() => {
    let active = 0;
    let critical = 0;
    let overdue = 0;
    for (const athlete of athletes) {
      if (athlete.is_active) active += 1;
      if (athlete.days_left < 0) overdue += 1;
      else if (athlete.days_left <= 3) critical += 1;
    }
    return { activeCount: active, criticalCount: critical, overdueCount: overdue };
  }, [athletes]);

  const handleOpen = (athlete?: Athlete) => {
    if (athlete) {
      setEditing(athlete);
    } else {
      setEditing(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleModalSuccess = () => {
    fetchAthletes();
    fetchShelves();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Athlete deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete athlete. Please try again.');
        console.error('Error deleting athlete:', error);
      }
    }
  };

  const kpiCards = useMemo(() => [
    {
      title: 'Active Members',
      value: activeCount,
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
  ], [activeCount, criticalCount, overdueCount]);

  return (
    <Box sx={{ minHeight: '100vh', py: 2 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Slide in={loaded} direction="down" timeout={500}>
          <Box sx={headerContainerSx}>
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
              label={`Total Members: ${totalCount}`}
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

        {/* Athletes Card Grid */}
        <Fade in={loaded} timeout={1000}>
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="#1e293b">
                Athletes ({totalCount} total, {athletes.length} loaded)
              </Typography>
            </Box>

            {/* Show skeleton loading while fetching */}
            {loading ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: `${GRID_GAP}px`,
              }}>
                {/* Show 6 skeleton cards while loading */}
                {[...Array(6)].map((_, index) => (
                  <AthleteCardSkeleton key={`skeleton-${index}`} />
                ))}
              </Box>
            ) : (
              <>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: `${GRID_GAP}px`,
                }}>
                  {sortedAthletes.map((athlete) => {
                    const shelf = shelves.find(s => s.id === athlete.shelf);
                    return (
                      <AthleteCard
                        key={athlete.id}
                        athlete={athlete}
                        shelf={shelf}
                        onCardClick={() => openProfile(athlete)}
                        onToggleStatus={() => handleToggleStatus(athlete)}
                        onEdit={() => handleOpen(athlete)}
                        onRenew={(e?: React.MouseEvent) => openRenewDialog(e!, athlete)}
                        onReassignShelf={() => handleReassignShelf(athlete)}
                        onDelete={() => handleDelete(athlete.id)}
                      />
                    );
                  })}
                </Box>

                {/* Infinite Scroll Trigger - invisible element to trigger loading */}
                <Box 
                  ref={loadMoreRef} 
                  sx={{ 
                    height: '20px', 
                    width: '100%',
                    visibility: 'hidden'
                  }} 
                />

                {/* Loading indicator when fetching next page */}
                {isFetchingNextPage && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress 
                      size={40} 
                      sx={{ 
                        color: '#6366f1',
                        mb: 2
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      Loading more athletes...
                    </Typography>
                  </Box>
                )}

                {/* Pagination Info */}
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Showing {sortedAthletes.length} of {totalCount} athletes
                  </Typography>
                  
                  {!hasNextPage && sortedAthletes.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      ✓ All athletes loaded
                    </Typography>
                  )}
                  
                  {hasNextPage && !isFetchingNextPage && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Scroll down to load more...
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Fade>

        {/* Add/Edit Dialog */}
        <AthleteRegistrationModal
          open={open}
          onClose={handleClose}
          editing={editing}
          shelves={shelves}
          onSuccess={handleModalSuccess}
        />

        {/* Shelf Reassignment Dialog */}
        {reassignOpen && (
          <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth
            PaperProps={{ sx: dialogPaperSx }}
          >
            <DialogTitle sx={dialogTitlePurpleSx}>
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
              <Button onClick={() => setReassignOpen(false)} sx={buttonSecondarySx}>
                Cancel
              </Button>
              <Button
                onClick={handleReassignSubmit}
                variant="contained"
                sx={buttonPrimaryPurpleSx}
              >
                Reassign
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Renewal Dialog */}
        {renewOpen && (
          <Dialog open={renewOpen} onClose={() => setRenewOpen(false)}
            PaperProps={{ sx: dialogPaperSx }}
          >
            <DialogTitle sx={dialogTitleGreenSx}>
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
              <Button onClick={() => setRenewOpen(false)} sx={buttonSecondarySx}>
                Cancel
              </Button>
              <Button
                onClick={submitRenew}
                variant="contained"
                sx={buttonPrimaryGreenSx}
              >
                Confirm Renewal
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Profile Dialog */}
        <AthleteProfile
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          athlete={profileAthlete}
          shelves={shelves}
          onRenew={() => {
            setProfileOpen(false);
            if (profileAthlete) {
              setRenewAthlete(profileAthlete);
              setRenewDuration(30);
              setRenewOpen(true);
            }
          }}
        />
      </Container>
    </Box>
  );
};

export default Athletes;
