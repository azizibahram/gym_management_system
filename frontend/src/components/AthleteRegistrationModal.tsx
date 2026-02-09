import { AttachMoney, CalendarToday, Notes as NotesIcon, Person, Phone, Storage } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PhotoUploader from './PhotoUploader';

interface Shelf {
  id: number;
  shelf_number: string;
  status: string;
  locker_duration_months?: number;
  locker_price?: number;
  locker_end_date?: string;
  locker_start_date?: string;
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
  debt: number;
  final_fee: number;
  contact_number: string;
  notes: string;
  shelf: number | null;
  days_left: number;
  is_active: boolean;
}

interface AthleteFormData {
  full_name: string;
  father_name: string;
  photo: File | null;
  gym_type: string;
  gym_time: string;
  discount: number;
  debt: number;
  contact_number: string;
  notes: string;
  shelf: string;
  fee_deadline_date: string;
  locker_duration_months: number;
  locker_price: number;
  locker_end_date: string;
}

interface AthleteRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  editing: Athlete | null;
  shelves: Shelf[];
  onSuccess: () => void;
}

const AthleteRegistrationModal: React.FC<AthleteRegistrationModalProps> = React.memo(({
  open,
  onClose,
  editing,
  shelves,
  onSuccess,
}) => {
  // Local form state - this is the key optimization!
  // By keeping form state local, we avoid re-rendering the parent component on every keystroke
  const [form, setForm] = useState<AthleteFormData>(() => ({
    full_name: editing?.full_name || '',
    father_name: editing?.father_name || '',
    photo: null,
    gym_type: editing?.gym_type || 'fitness',
    gym_time: editing?.gym_time || 'morning',
    discount: editing?.discount || 0,
    debt: editing?.debt || 0,
    contact_number: editing?.contact_number || '',
    notes: editing?.notes || '',
    shelf: editing?.shelf ? String(editing.shelf) : '',
    fee_deadline_date: editing?.fee_deadline_date || '',
    locker_duration_months: 1,
    locker_price: 0,
    locker_end_date: '',
  }));

  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens with editing data
  React.useEffect(() => {
    if (open) {
      setForm({
        full_name: editing?.full_name || '',
        father_name: editing?.father_name || '',
        photo: null,
        gym_type: editing?.gym_type || 'fitness',
        gym_time: editing?.gym_time || 'morning',
        discount: editing?.discount || 0,
        debt: editing?.debt || 0,
        contact_number: editing?.contact_number || '',
        notes: editing?.notes || '',
        shelf: editing?.shelf ? String(editing.shelf) : '',
        fee_deadline_date: editing?.fee_deadline_date || '',
        locker_duration_months: 1,
        locker_price: 0,
        locker_end_date: '',
      });
    }
  }, [open, editing]);

  // Auto-calculate locker end date when duration changes
  React.useEffect(() => {
    if (form.locker_duration_months && form.shelf) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + form.locker_duration_months);
      const formattedEndDate = endDate.toISOString().split('T')[0];
      setForm(prev => ({
        ...prev,
        locker_end_date: formattedEndDate
      }));
    }
  }, [form.locker_duration_months, form.shelf]);

  // Memoized fee calculation
  const finalFee = useMemo(() => {
    const base = form.gym_type === 'fitness' ? 1000 : 700;
    return base - form.discount - form.debt;
  }, [form.gym_type, form.discount, form.debt]);

  // Memoized locker total
  const lockerTotal = useMemo(() => {
    return form.locker_duration_months * Number(form.locker_price);
  }, [form.locker_duration_months, form.locker_price]);

  const handleSubmit = useCallback(async () => {
    if (!form.full_name.trim()) {
      toast.error('Please enter full name');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('full_name', form.full_name);
    data.append('father_name', form.father_name);
    if (form.photo) data.append('photo', form.photo);
    data.append('gym_type', form.gym_type);
    data.append('gym_time', form.gym_time);
    data.append('discount', form.discount.toString());
    data.append('debt', form.debt.toString());
    data.append('contact_number', form.contact_number);
    data.append('notes', form.notes);
    if (form.shelf) {
      data.append('shelf', form.shelf);
      data.append('locker_duration_months', form.locker_duration_months.toString());
      data.append('locker_price', form.locker_price.toString());
      if (form.locker_end_date) {
        data.append('locker_end_date', form.locker_end_date);
      }
    }
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
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save athlete. Please try again.');
      console.error('Error saving athlete:', error);
    } finally {
      setSubmitting(false);
    }
  }, [form, editing, onSuccess, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
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
                onPhotoChange={(file) => setForm(prev => ({ ...prev, photo: file }))}
                currentPhoto={editing?.photo}
              />
            </Box>

            <TextField
              label="Full Name"
              value={form.full_name}
              onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
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
              onChange={(e) => setForm(prev => ({ ...prev, father_name: e.target.value }))}
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
              onChange={(e) => setForm(prev => ({ ...prev, contact_number: e.target.value }))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, gym_type: e.target.value }))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, gym_time: e.target.value }))}
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Discount"
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Debt"
                  type="number"
                  value={form.debt}
                  onChange={(e) => setForm(prev => ({ ...prev, debt: Number(e.target.value) }))}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: '#ef4444' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  helperText="Subtracts from fee"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Final Fee"
                  value={finalFee}
                  fullWidth
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: '#10b981' }} />
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
              onChange={(e) => setForm(prev => ({ ...prev, fee_deadline_date: e.target.value }))}
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
                onChange={(e) => setForm(prev => ({ ...prev, shelf: e.target.value }))}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {shelves && Array.isArray(shelves) && shelves.filter(s => s.status === 'available' || s.id.toString() === form.shelf).map(shelf => (
                  <MenuItem key={shelf.id} value={String(shelf.id)}>{shelf.shelf_number}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Locker Duration & Price Section - Only show if locker is selected */}
            {form.shelf && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 2, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#6366f1', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage /> Locker Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Duration</InputLabel>
                      <Select
                        value={form.locker_duration_months}
                        label="Duration"
                        onChange={(e) => {
                          const duration = Number(e.target.value);
                          setForm(prev => ({ ...prev, locker_duration_months: duration }));
                        }}
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value={1}>1 Month</MenuItem>
                        <MenuItem value={3}>3 Months</MenuItem>
                        <MenuItem value={6}>6 Months</MenuItem>
                        <MenuItem value={12}>12 Months</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Price per Month"
                      type="number"
                      value={form.locker_price}
                      onChange={(e) => setForm(prev => ({ ...prev, locker_price: Number(e.target.value) }))}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: '#6366f1' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={form.locker_end_date}
                      onChange={(e) => setForm(prev => ({ ...prev, locker_end_date: e.target.value }))}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: '#6366f1' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2, 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      borderRadius: 2,
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Total Locker Fee:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {lockerTotal} AFN
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
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
          onClick={onClose} 
          sx={{ color: '#64748b', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(100, 116, 139, 0.1)' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
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
            '&:disabled': {
              opacity: 0.7,
            }
          }}
        >
          {submitting ? 'Saving...' : (editing ? 'Update' : 'Register')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AthleteRegistrationModal;
