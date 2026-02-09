import { CreditCard, Delete, Edit, Person, Schedule, Storage, ToggleOff, ToggleOn } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Chip, IconButton, Tooltip, Typography } from '@mui/material';
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

interface AthleteCardProps {
  athlete: Athlete;
  shelf: Shelf | undefined;
  onCardClick: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onRenew: (e?: React.MouseEvent) => void;
  onReassignShelf: () => void;
  onDelete: () => void;
  getStatusChip: (daysLeft: number) => React.ReactNode;
}

const CARD_HEIGHT = 480;
const GRID_GAP = 16;

const AthleteCard: React.FC<AthleteCardProps> = React.memo(({
  athlete,
  shelf,
  onCardClick,
  onToggleStatus,
  onEdit,
  onRenew,
  onReassignShelf,
  onDelete,
  getStatusChip,
}) => {
  // Memoize shelf lookup - O(1) instead of O(n) find()
  const athleteShelf = useMemo(() => shelf, [shelf?.id, athlete.shelf]);

  return (
    <Card
      onClick={onCardClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        '& .athlete-card-actions': {
          opacity: 0,
          transform: 'translateY(8px)',
          pointerEvents: 'none',
          transition: 'all 0.2s ease',
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
        '&:hover .athlete-card-actions': {
          opacity: 1,
          transform: 'translateY(0)',
          pointerEvents: 'auto',
        },
      }}
    >
      {/* Photo Section */}
      <Box sx={{
        position: 'relative',
        height: 220,
        background: athlete.photo
          ? `url(${athlete.photo.startsWith('http') ? athlete.photo : `http://localhost:8000${athlete.photo}`})`
          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}>
        {!athlete.photo && (
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Person sx={{ fontSize: 36, color: 'white' }} />
          </Avatar>
        )}

        {/* Active/Inactive Indicator */}
        <Box sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: athlete.is_active ? '#10b981' : '#94a3b8',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
        }} />

        {/* Actions Overlay */}
        <Box
          className="athlete-card-actions"
          sx={{
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: 10,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
            backdropFilter: 'blur(8px)',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 1.5,
            py: 0.5,
          }}
        >
          <Tooltip title={athlete.is_active ? "Deactivate" : "Activate"}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)' }, width: 28, height: 28 }}
            >
              {athlete.is_active ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.3)' }, width: 28, height: 28 }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Renew">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRenew(e); }} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)' }, width: 28, height: 28 }}>
              <CreditCard fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Locker">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onReassignShelf(); }} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' }, width: 28, height: 28 }}>
              <Storage fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.3)' }, width: 28, height: 28 }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Compact Info Section with Labels */}
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Name & Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
              {athlete.full_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {athlete.gym_time}
              </Typography>
            </Box>
          </Box>
          {getStatusChip(athlete.days_left)}
        </Box>

        {/* Info Grid with Labels */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {/* Gym Type */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              Gym Type
            </Typography>
            <Chip
              label={athlete.gym_type}
              size="small"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 600,
                fontSize: '0.75rem',
                background: athlete.gym_type === 'fitness' ? '#6366f1' : '#ec4899',
                color: 'white',
                height: 24,
                mt: 0,
              }}
            />
          </Box>

          {/* Contact */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              Contact
            </Typography>
            <Typography variant="body2" fontWeight={600} color="#1e293b">
              {athlete.contact_number || 'N/A'}
            </Typography>
          </Box>

          {/* Fee Due */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              Fee Due
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={600} color="#10b981">
                {athlete.fee_deadline_date}
              </Typography>
            </Box>
          </Box>

          {/* Locker Deadline */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              Locker Deadline
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Storage sx={{ fontSize: 16, color: '#6366f1' }} />
              <Typography variant="body2" fontWeight={600} color="#1e293b">
                {athleteShelf?.locker_end_date || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* Locker */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Locker
            </Typography>
            {athleteShelf ? (
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={athleteShelf.shelf_number}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    color: 'white',
                    height: 24,
                  }}
                />
                {athleteShelf.locker_end_date && (
                  <Typography variant="caption" sx={{ display: 'block', color: '#f59e0b', fontWeight: 600, mt: 0.5 }}>
                    Due: {athleteShelf.locker_end_date}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" fontWeight={600} color="text.disabled" sx={{ mt: 0.5 }}>
                Not assigned
              </Typography>
            )}
          </Box>

          {/* Debt */}
          {Number(athlete.debt) > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Debt
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#ef4444', mt: 0.5 }}>
                {athlete.debt} AFN
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export { CARD_HEIGHT, GRID_GAP };
export default AthleteCard;
