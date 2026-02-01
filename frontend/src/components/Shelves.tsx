import { Add, ArrowDownward, ArrowUpward, Delete, Edit, Inventory, Search, Storage } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fade, Grow, InputAdornment, Paper, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Shelf {
  id: number;
  shelf_number: string;
  status: string;
  assigned_athlete: number | null;
  athlete_name: string | null;
}

const Shelves: React.FC = () => {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shelf | null>(null);
  const [shelfNumber, setShelfNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      await fetchShelves();
    };
    loadData();
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const handleOpen = (shelf?: Shelf) => {
    if (shelf) {
      setEditing(shelf);
      setShelfNumber(shelf.shelf_number);
    } else {
      setEditing(null);
      setShelfNumber('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      if (editing) {
        await axios.put(`http://localhost:8000/api/shelves/${editing.id}/`, { shelf_number: shelfNumber }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Shelf "${shelfNumber}" updated successfully!`);
      } else {
        await axios.post('http://localhost:8000/api/shelves/', { shelf_number: shelfNumber }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Shelf "${shelfNumber}" created successfully!`);
      }
      handleClose();
      fetchShelves();
    } catch (error) {
      toast.error('Failed to save shelf. Please try again.');
      console.error('Error saving shelf:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shelf?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:8000/api/shelves/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Shelf deleted successfully!');
        fetchShelves();
      } catch (error) {
        toast.error('Failed to delete shelf. Please try again.');
        console.error('Error deleting shelf:', error);
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalShelves = shelves.length;
  const availableShelves = Array.isArray(shelves) ? shelves.filter(s => s.status === 'available').length : 0;
  const assignedShelves = Array.isArray(shelves) ? shelves.filter(s => s.status === 'assigned').length : 0;

  const filteredShelves = shelves.filter(shelf =>
    shelf.shelf_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shelf.athlete_name && shelf.athlete_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedShelves = [...filteredShelves].sort((a, b) => {
    let aVal, bVal;
    if (sortField === 'shelf_number') {
      const aNum = parseInt(a.shelf_number.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.shelf_number.replace(/\D/g, '')) || 0;
      aVal = aNum;
      bVal = bNum;
    } else if (sortField === 'status') {
      aVal = a.status;
      bVal = b.status;
    } else if (sortField === 'assigned_athlete') {
      aVal = a.athlete_name || '';
      bVal = b.athlete_name || '';
    } else {
      return 0;
    }
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />;
  };

  const kpiCards = [
    {
      title: 'Total Lockers',
      value: totalShelves,
      subtitle: 'All storage units',
      icon: <Inventory sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      shadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
      delay: 100,
    },
    {
      title: 'Available',
      value: availableShelves,
      subtitle: 'Ready for use',
      icon: <Storage sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      shadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
      delay: 200,
    },
    {
      title: 'Assigned',
      value: assignedShelves,
      subtitle: 'Currently in use',
      icon: <Edit sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
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
              Locker Management
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
              Manage your gym equipment storage
            </Typography>
            <Chip
              label={`Total Lockers: ${totalShelves}`}
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
            Locker Statistics
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
                    <CardContent sx={{ p: 4, textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <Avatar sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 60,
                        height: 60,
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

        {/* Table Section */}
        <Fade in={loaded} timeout={800}>
          <Paper sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            }
          }}>
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <TextField
                label="Search Lockers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  minWidth: 300,
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
                Create New Locker
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
                    <TableCell 
                      onClick={() => handleSort('shelf_number')} 
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        '&:hover': { color: '#6366f1' },
                        transition: 'color 0.2s ease',
                      }}
                    >
                      Locker Number {getSortIcon('shelf_number')}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('status')} 
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        '&:hover': { color: '#6366f1' },
                        transition: 'color 0.2s ease',
                      }}
                    >
                      Status {getSortIcon('status')}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('assigned_athlete')} 
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        '&:hover': { color: '#6366f1' },
                        transition: 'color 0.2s ease',
                      }}
                    >
                      Assigned Athlete {getSortIcon('assigned_athlete')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedShelves.map((shelf, index) => (
                    <Grow in={true} timeout={300 + index * 50} key={shelf.id}>
                      <TableRow hover sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          backgroundColor: 'rgba(99, 102, 241, 0.04)',
                          transform: 'scale(1.005)',
                        }
                      }}>
                        <TableCell>
                          <Chip 
                            label={shelf.shelf_number}
                            sx={{ 
                              fontWeight: 700, 
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={shelf.status}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              background: shelf.status === 'available' 
                                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' 
                                : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                              color: 'white',
                              boxShadow: shelf.status === 'available' 
                                ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
                                : '0 2px 8px rgba(245, 158, 11, 0.3)',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500, color: shelf.athlete_name ? '#1e293b' : '#94a3b8' }}>
                            {shelf.athlete_name || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              startIcon={<Edit />} 
                              onClick={() => handleOpen(shelf)}
                              sx={{
                                color: '#6366f1',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' },
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="small" 
                              color="error" 
                              startIcon={<Delete />} 
                              onClick={() => handleDelete(shelf.id)}
                              sx={{ fontWeight: 600 }}
                            >
                              Delete
                            </Button>
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

        {/* Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose}
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
            {editing ? 'Edit Locker' : 'Create New Locker'}
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 2, px: 4, minWidth: 400 }}>
            <TextField 
              label="Locker Number" 
              value={shelfNumber} 
              onChange={(e) => setShelfNumber(e.target.value)} 
              fullWidth 
              margin="normal" 
              required 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 3 }}>
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
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Shelves;
