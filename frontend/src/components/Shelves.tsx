import { Add, ArrowDownward, ArrowUpward, Delete, Edit, Inventory, Storage } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fade, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Zoom } from '@mui/material';
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
    (async () => {
      await fetchShelves();
    })();
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

  return (
    <Box sx={{
      minHeight: '100vh',
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
            🏋️‍♂️ Locker Management
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Manage your gym equipment storage
          </Typography>
          <Chip
            label={`Total Lockers: ${totalShelves}`}
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
            Locker Statistics
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!shelves} style={{ transitionDelay: '100ms' }}>
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
                      <Inventory sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {totalShelves}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Total Lockers
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      All storage units in the system
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!shelves} style={{ transitionDelay: '200ms' }}>
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
                      <Storage sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {availableShelves}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Available Lockers
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Ready for equipment storage
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>

            <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Zoom in={!!shelves} style={{ transitionDelay: '300ms' }}>
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
                      <Edit sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, fontSize: '2.5rem' }}>
                      {assignedShelves}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Assigned Lockers
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Currently in use by members
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          </Box>
        </Box>

        {/* Table Section */}
        <Fade in={!!shelves} timeout={1000}>
          <Paper sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e9ecef'
          }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Search Lockers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}>
                Create New Locker
              </Button>
            </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('shelf_number')} style={{ cursor: 'pointer' }}>
                Locker Number {sortField === 'shelf_number' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
              </TableCell>
              <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
              </TableCell>
              <TableCell onClick={() => handleSort('assigned_athlete')} style={{ cursor: 'pointer' }}>
                Assigned Athlete {sortField === 'assigned_athlete' && (sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedShelves.map((shelf) => (
              <TableRow key={shelf.id} hover>
                <TableCell>{shelf.shelf_number}</TableCell>
                <TableCell>
                  <span style={{
                    color: shelf.status === 'available' ? '#4caf50' : '#ff0000',
                    fontWeight: 'bold'
                  }}><Box component="span" sx={{
                                        px: 1, py: 0.5,
                                        bgcolor: '#edf0f3',
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                      }}>
                                         {shelf.status}
                                      </Box>
                    
                  </span>
                </TableCell>
                <TableCell>{shelf.athlete_name || '-'}</TableCell>
                <TableCell>
                  <Button size="small" startIcon={<Edit />} onClick={() => handleOpen(shelf)}>Edit</Button>
                  <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(shelf.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editing ? 'Edit Locker' : 'Create Locker'}</DialogTitle>
        <DialogContent>
          <TextField label="Locker Number" value={shelfNumber} onChange={(e) => setShelfNumber(e.target.value)} fullWidth margin="normal" required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Shelves;