import { AccessTime, AccountBox, Add, AttachMoney, CalendarToday, Cancel, CheckCircle, CreditCard, Delete, Edit, FitnessCenter, History, Notes as NotesIcon, Person, Phone, Storage, ToggleOff, ToggleOn, VerifiedUser } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignAthlete, setReassignAthlete] = useState<Athlete | null>(null);
  const [newShelfId, setNewShelfId] = useState('');
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

  // Renewal & Profile State
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewAthlete, setRenewAthlete] = useState<Athlete | null>(null);
  const [renewDuration, setRenewDuration] = useState(30);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAthlete, setProfileAthlete] = useState<Athlete | null>(null);



  useEffect(() => {
    fetchAthletes();
    fetchShelves();
  }, [searchQuery, filterGymType, filterGymTime, filterFeeStatus]);

  const fetchAthletes = async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();

    if (searchQuery) params.append('search', searchQuery);
    if (filterGymType) params.append('gym_type', filterGymType);
    if (filterGymTime) params.append('gym_time', filterGymTime);
    if (filterFeeStatus) params.append('fee_status', filterFeeStatus);

    const response = await axios.get(`http://localhost:8000/api/athletes/?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAthletes(response.data);
  };

  const fetchShelves = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8000/api/shelves/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShelves(response.data);
  };

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
    await axios.post(`http://localhost:8000/api/athletes/${renewAthlete.id}/renew/`, {
      duration: renewDuration
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setRenewOpen(false);
    fetchAthletes();
  };

  const handleToggleStatus = async (athlete: Athlete) => {
    const token = localStorage.getItem('token');
    await axios.post(`http://localhost:8000/api/athletes/${athlete.id}/toggle_status/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAthletes();
  };

  const openProfile = (athlete: Athlete) => {
    setProfileAthlete(athlete);
    setProfileOpen(true);
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

    await axios.put(`http://localhost:8000/api/athletes/${reassignAthlete.id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setReassignOpen(false);
    setReassignAthlete(null);
    fetchAthletes();
    fetchShelves();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterGymType('');
    setFilterGymTime('');
    setFilterFeeStatus('');
  };

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

    if (editing) {
      await axios.put(`http://localhost:8000/api/athletes/${editing.id}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post('http://localhost:8000/api/athletes/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    handleClose();
    fetchAthletes();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/athletes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAthletes();
    }
  };

  const getColor = (days: number) => {
    if (days > 15) return 'green';
    if (days > 5) return 'orange';
    return 'red';
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Athletics Management
        {(criticalCount > 0 || overdueCount > 0) && (
          <span style={{ marginLeft: '16px' }}>
            {criticalCount > 0 && (
              <span style={{
                backgroundColor: '#ff9800',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                marginRight: '8px'
              }}>
                {criticalCount} Critical
              </span>
            )}
            {overdueCount > 0 && (
              <span style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {overdueCount} Overdue
              </span>
            )}
          </span>
        )}
      </Typography>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="Search athletes..."
          placeholder="Search by name, father name, or contact"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ mb: 2 }}
        />

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Gym Type</InputLabel>
            <Select value={filterGymType} onChange={(e) => setFilterGymType(e.target.value)} label="Gym Type">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="fitness">Fitness</MenuItem>
              <MenuItem value="bodybuilding">Bodybuilding</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Gym Time</InputLabel>
            <Select value={filterGymTime} onChange={(e) => setFilterGymTime(e.target.value)} label="Gym Time">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="morning">Morning</MenuItem>
              <MenuItem value="afternoon">Afternoon</MenuItem>
              <MenuItem value="night">Night</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Fee Status</InputLabel>
            <Select value={filterFeeStatus} onChange={(e) => setFilterFeeStatus(e.target.value)} label="Fee Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="safe">Safe (16+ days)</MenuItem>
              <MenuItem value="warning">Warning (6-15 days)</MenuItem>
              <MenuItem value="critical">Critical (1-5 days)</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>

          {activeFiltersCount > 0 && (
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters ({activeFiltersCount})
            </Button>
          )}
        </div>
      </Paper>

      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Register Athlete
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Showing {athletes.length} athlete{athletes.length !== 1 ? 's' : ''}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Gym Type</TableCell>
              <TableCell>Gym Time</TableCell>
              <TableCell>Shelf</TableCell>
              <TableCell>Reg Date</TableCell>
              <TableCell>Fee Deadline</TableCell>
              <TableCell>Days Left</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow
                key={athlete.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                onClick={() => openProfile(athlete)}
              >
                <TableCell>
                  <Avatar
                    src={athlete.photo ? (athlete.photo.startsWith('http') ? athlete.photo : `http://localhost:8000${athlete.photo}`) : undefined}
                    alt={athlete.full_name}
                    sx={{ width: 50, height: 50, border: '2px solid white', boxShadow: 1 }}
                  >
                    {!athlete.photo && <Person />}
                  </Avatar>
                </TableCell>
                <TableCell>{athlete.full_name}</TableCell>
                <TableCell>{athlete.gym_type}</TableCell>
                <TableCell>{athlete.gym_time}</TableCell>
                <TableCell>
                  {athlete.shelf ? (
                    <Box component="span" sx={{
                      px: 1, py: 0.5,
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Shelf {shelves.find(s => s.id === Number(athlete.shelf))?.shelf_number || athlete.shelf}
                    </Box>
                  ) : (
                    <span style={{ color: '#9e9e9e' }}>-</span>
                  )}
                </TableCell>
                <TableCell>{athlete.registration_date}</TableCell>
                <TableCell>{athlete.fee_deadline_date}</TableCell>
                <TableCell style={{
                  color: getColor(athlete.days_left),
                  fontWeight: 'bold'
                }}>
                  {athlete.days_left} days
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={athlete.is_active ? "Deactivate" : "Activate"}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleStatus(athlete); }}>
                        {athlete.is_active ? <ToggleOn color="success" fontSize="large" /> : <ToggleOff color="action" fontSize="large" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpen(athlete); }}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Renew Membership">
                      <IconButton size="small" color="success" onClick={(e) => openRenewDialog(e, athlete)}>
                        <CreditCard />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reassign Shelf">
                      <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handleReassignShelf(athlete); }}>
                        <Storage />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(athlete.id); }}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          {editing ? 'Edit Athlete' : 'Register New Athlete'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Left Column - Personal Info */}
            <Box sx={{ flex: { md: 4, xs: 12 }, width: '100%' }}>
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
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#667eea' }} />
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
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#667eea' }} />
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
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Right Column - Gym Details */}
            <Box sx={{ flex: { md: 8, xs: 12 }, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 3, color: '#667eea', fontWeight: 600, borderBottom: '2px solid #f0f0f0', pb: 1 }}>
                MEMBERSHIP DETAILS
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Gym Type</InputLabel>
                    <Select
                      value={form.gym_type}
                      label="Gym Type"
                      onChange={(e) => setForm({ ...form, gym_type: e.target.value })}
                      startAdornment={
                        <InputAdornment position="start">
                          <FitnessCenter sx={{ color: '#667eea', mr: 1 }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="fitness">Fitness</MenuItem>
                      <MenuItem value="bodybuilding">Bodybuilding</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Gym Time</InputLabel>
                    <Select
                      value={form.gym_time}
                      label="Gym Time"
                      onChange={(e) => setForm({ ...form, gym_time: e.target.value })}
                      startAdornment={
                        <InputAdornment position="start">
                          <AccessTime sx={{ color: '#667eea', mr: 1 }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="morning">Morning</MenuItem>
                      <MenuItem value="afternoon">Afternoon</MenuItem>
                      <MenuItem value="night">Night</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Discount"
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Final Fee"
                    value={calculateFee(form.gym_type, form.discount)}
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              <TextField
                label="Fee Deadline (Optional)"
                type="date"
                value={form.fee_deadline_date}
                onChange={(e) => setForm({ ...form, fee_deadline_date: e.target.value })}
                fullWidth
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
                helperText="Defaults to 30 days from today"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Assigned Shelf</InputLabel>
                <Select
                  value={form.shelf}
                  label="Assigned Shelf"
                  onChange={(e) => setForm({ ...form, shelf: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">
                      <Storage sx={{ color: '#667eea', mr: 1 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {shelves.filter(s => s.status === 'available' || s.id.toString() === form.shelf).map(shelf => (
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
                      <NotesIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editing ? 'Update' : 'Register'}</Button>
        </DialogActions>
      </Dialog>

      {/* Shelf Reassignment Dialog */}
      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign Shelf for {reassignAthlete?.full_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select New Shelf</InputLabel>
            <Select
              value={newShelfId}
              onChange={(e) => setNewShelfId(e.target.value)}
              label="Select New Shelf"
            >
              <MenuItem value=""><em>No Shelf</em></MenuItem>
              {shelves.filter(s => s.status === 'available' || s.id.toString() === newShelfId).map(shelf => (
                <MenuItem key={shelf.id} value={shelf.id}>
                  Shelf {shelf.shelf_number} - {shelf.status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Current shelf: {reassignAthlete?.shelf ? `Shelf ${reassignAthlete.shelf}` : 'None'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignOpen(false)}>Cancel</Button>
          <Button onClick={handleReassignSubmit} variant="contained" color="primary">
            Reassign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renewal Dialog */}
      <Dialog open={renewOpen} onClose={() => setRenewOpen(false)}>
        <DialogTitle>Renew Membership</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Renew membership for <strong>{renewAthlete?.full_name}</strong>?
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Duration</InputLabel>
            <Select
              value={renewDuration}
              label="Duration"
              onChange={(e) => setRenewDuration(Number(e.target.value))}
            >
              <MenuItem value={30}>1 Month (30 Days)</MenuItem>
              <MenuItem value={60}>2 Months (60 Days)</MenuItem>
              <MenuItem value={90}>3 Months (90 Days)</MenuItem>
              <MenuItem value={180}>6 Months (180 Days)</MenuItem>
              <MenuItem value={365}>1 Year (365 Days)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewOpen(false)}>Cancel</Button>
          <Button onClick={submitRenew} variant="contained" color="success">
            Confirm Renewal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          Athlete Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 4, bgcolor: '#f5f7fa' }}>
          {profileAthlete && (
            <Box>
              {/* Header Card */}
              <Paper elevation={0} sx={{
                p: 3,
                mb: 3,
                mt: 3,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #fff 0%, #f0f4ff 100%)',
                border: '1px solid #e3e8ee'
              }}>
                <Avatar
                  src={profileAthlete.photo ? (profileAthlete.photo.startsWith('http') ? profileAthlete.photo : `http://localhost:8000${profileAthlete.photo}`) : undefined}
                  sx={{ width: 100, height: 100, mr: 3, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2d3748' }}>{profileAthlete.full_name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={profileAthlete.is_active ? "Active Member" : "Inactive"}
                      color={profileAthlete.is_active ? "success" : "default"}
                      icon={profileAthlete.is_active ? <CheckCircle /> : <Cancel />}
                      size="small"
                    />
                    <Chip
                      label={profileAthlete.days_left < 0 ? 'Overdue' : 'Good Standing'}
                      color={profileAthlete.days_left < 0 ? 'error' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Personal Info Card */}
                <Card elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBox color="primary" /> Personal Details
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Contact</Typography>
                        <Typography variant="body2" fontWeight={600}>{profileAthlete.contact_number || 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Father Name</Typography>
                        <Typography variant="body2" fontWeight={600}>{profileAthlete.father_name || 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Gym Type</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{profileAthlete.gym_type}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Assigned Shelf</Typography>
                        <Chip
                          label={profileAthlete.shelf ? `Shelf ${shelves.find(s => s.id === Number(profileAthlete.shelf))?.shelf_number || profileAthlete.shelf}` : 'None'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Membership Status Card */}
                <Card elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUser color="primary" /> Current Status
                    </Typography>
                    <Box sx={{ bgcolor: profileAthlete.days_left < 0 ? '#ffebee' : '#e8f5e9', p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: profileAthlete.days_left < 0 ? 'error.main' : 'success.main' }}>
                        {profileAthlete.days_left < 0
                          ? `${Math.abs(profileAthlete.days_left)} Days Overdue`
                          : `${profileAthlete.days_left} Days Remaining`}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Deadline: {profileAthlete.fee_deadline_date}
                      </Typography>
                    </Box>
                    {profileAthlete.days_left < 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                        <AttachMoney />
                        <Typography variant="body2" fontWeight={700}>
                          Est. Debt: ${(Math.ceil(Math.abs(profileAthlete.days_left) / 30) * Number(profileAthlete.final_fee)).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Payment History Table */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History color="primary" /> Payment History
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profileAthlete.payments && profileAthlete.payments.length > 0 ? (
                      profileAthlete.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.payment_date}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            <Chip
                              label={payment.payment_type}
                              size="small"
                              color={payment.payment_type === 'renewal' ? 'success' : 'primary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>{payment.notes}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
          <Button onClick={() => { setProfileOpen(false); openRenewDialog({ stopPropagation: () => { } } as any, profileAthlete!); }} variant="contained">
            Renew Membership
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Athletes;