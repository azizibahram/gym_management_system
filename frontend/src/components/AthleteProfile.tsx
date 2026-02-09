import { AccountBox, Cancel, CheckCircle, History, Warning } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useMemo } from 'react';

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
  debt: number;
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
  locker_duration_months?: number;
  locker_price?: number;
  locker_end_date?: string;
  locker_start_date?: string;
}

interface AthleteProfileProps {
  open: boolean;
  onClose: () => void;
  athlete: Athlete | null;
  shelves: Shelf[];
  onRenew?: () => void;
}

const dialogTitlePurpleSx = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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

const AthleteProfile: React.FC<AthleteProfileProps> = React.memo(({
  open,
  onClose,
  athlete,
  shelves,
  onRenew,
}) => {
  // Memoize shelf lookup to avoid repeated searches
  const athleteShelf = useMemo(() => {
    if (!athlete?.shelf) return null;
    return shelves.find(s => s.id === Number(athlete.shelf)) || null;
  }, [athlete?.shelf, shelves]);

  if (!athlete) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ 
        sx: {
          borderRadius: 4,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }
      }}
    >
      <DialogTitle sx={{ ...dialogTitlePurpleSx, fontWeight: 500 }}>
        Athlete Profile
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 4, bgcolor: '#f8fafc' }}>
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
              src={athlete.photo ? (athlete.photo.startsWith('http') ? athlete.photo : `http://localhost:8000${athlete.photo}`) : undefined}
              sx={{ width: 90, height: 90, mr: 3, border: '4px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{athlete.full_name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={athlete.is_active ? "Active" : "Inactive"}
                  color={athlete.is_active ? "success" : "default"}
                  icon={athlete.is_active ? <CheckCircle /> : <Cancel />}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={athlete.days_left < 0
                    ? `${Math.abs(athlete.days_left)} Days Overdue`
                    : `${athlete.days_left} Days Remaining`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: athlete.days_left < 0 ? '#ef4444' : '#10b981',
                    color: 'white',
                  }}
                />
                <Chip
                  label={`Fee Due: ${athlete.fee_deadline_date}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                {Number(athlete.debt) > 0 && (
                  <Chip
                    label={`Debt: ${athlete.debt} AFN`}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: '#ef4444',
                      color: 'white',
                    }}
                  />
                )}
                {athlete.days_left < 0 && (
                  <Chip
                    label={`Est. Debt: ${(Math.ceil(Math.abs(athlete.days_left) / 30) * Number(athlete.final_fee)).toFixed(2)}`}
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 600 }}
                  />
                )}
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
                      <Typography variant="body2" fontWeight={700}>{athlete.contact_number || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Father Name</Typography>
                      <Typography variant="body2" fontWeight={700}>{athlete.father_name || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Gym Type</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{athlete.gym_type}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Debt</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: Number(athlete.debt) > 0 ? '#ef4444' : '#10b981' }}>
                        {athlete.debt > 0 ? `${athlete.debt} AFN` : 'No Debt'}
                      </Typography>
                    </Box>
                  </Box>
                  {athlete.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'pre-wrap' }}>{athlete.notes}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Locker Details Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ border: '1px solid #e3e8ee', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#6366f1', fontWeight: 700 }}>
                    <History /> Membership Details
                  </Typography>
                  {athleteShelf ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Locker</Typography>
                        <Typography variant="body2" fontWeight={700}>{athleteShelf.shelf_number}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Chip
                          label={athleteShelf.status}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            bgcolor: athleteShelf.status === 'assigned' ? '#10b981' : '#94a3b8',
                            color: 'white',
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Start Date</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#f59e0b' }}>
                          {athleteShelf.locker_start_date || '-'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">End Date</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {athleteShelf.locker_end_date || '-'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {athleteShelf.locker_duration_months ? `${athleteShelf.locker_duration_months} months` : '-'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Price</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {athleteShelf.locker_price ? `${athleteShelf.locker_price} AFN` : '-'}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No locker assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Debt Summary */}
          {Number(athlete.debt) > 0 && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning sx={{ color: '#ef4444' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ef4444' }}>
                  Outstanding Debt
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444' }}>
                {athlete.debt} AFN
              </Typography>
            </Box>
          )}

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
                {athlete.payments && athlete.payments.length > 0 ? (
                  athlete.payments.map((payment) => (
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
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} sx={buttonSecondarySx}>
          Close
        </Button>
        {onRenew && (
          <Button
            onClick={onRenew}
            variant="contained"
            sx={buttonPrimaryPurpleSx}
          >
            Renew Membership
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default AthleteProfile;
