import { CreditCard, Delete, Edit, Person, Storage, ToggleOff, ToggleOn } from '@mui/icons-material';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
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
  payments?: Payment[]; // Optional - only included in detail views
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
}

const CARD_HEIGHT = 420;
const GRID_GAP = 16;

// Status color for the accent line at the top
const getStatusAccent = (daysLeft: number, isActive: boolean) => {
  if (!isActive) return '#94a3b8';
  if (daysLeft < 0) return '#ef4444';
  if (daysLeft <= 5) return '#f59e0b';
  if (daysLeft <= 15) return '#3b82f6';
  return '#10b981';
};

const AthleteCard: React.FC<AthleteCardProps> = React.memo(({
  athlete,
  shelf,
  onCardClick,
  onToggleStatus,
  onEdit,
  onRenew,
  onReassignShelf,
  onDelete,
}) => {
  const athleteShelf = useMemo(() => shelf, [shelf?.id, athlete.shelf]);

  const photoUrl = athlete.photo
    ? (athlete.photo.startsWith('http') ? athlete.photo : athlete.photo)
    : null;

  const accentColor = getStatusAccent(athlete.days_left, athlete.is_active);

  return (
    <Box
      onClick={onCardClick}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        height: CARD_HEIGHT,
        // Full image background
        background: photoUrl
          ? `url(${photoUrl}) center/cover no-repeat`
          : 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        // Subtle scale on hover
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.025)',
        },
        // Reveal actions on hover
        '& .card-actions': {
          opacity: 0,
          transform: 'translateY(6px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
        },
        '&:hover .card-actions': {
          opacity: 1,
          transform: 'translateY(0)',
          pointerEvents: 'auto',
        },
      }}
    >
      {/* Always-visible member ID for quick cross-checking related registrations */}
      <Box sx={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 3,
      }}>
        <Chip
          label={`ID ${athlete.id}`}
          size="small"
          sx={{
            height: 28,
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#fff',
            bgcolor: 'rgba(5,5,15,0.78)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.22)',
            '& .MuiChip-label': { px: 1.2 },
          }}
        />
      </Box>

      {/* Top row: action buttons only */}
      <Box sx={{
        position: 'absolute',
        top: 14,
        right: 14,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 3,
      }}>
        {/* Action buttons with dark backdrop - BIGGER */}
        <Box
          className="card-actions"
          sx={{
            display: 'flex',
            gap: 0.75,
            justifyContent: 'flex-end',
            bgcolor: 'rgba(5,5,15,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2.5,
            p: 0.75,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={athlete.is_active ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="medium"
              onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
              sx={{
                color: '#fff',
                width: 40, height: 40,
                '&:hover': { bgcolor: 'rgba(16,185,129,0.3)' },
              }}
            >
              {athlete.is_active ? <ToggleOn sx={{ fontSize: 24 }} /> : <ToggleOff sx={{ fontSize: 24 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="medium"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              sx={{
                color: '#fff',
                width: 40, height: 40,
                '&:hover': { bgcolor: 'rgba(99,102,241,0.3)' },
              }}
            >
              <Edit sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Renew">
            <IconButton
              size="medium"
              onClick={(e) => { e.stopPropagation(); onRenew(e); }}
              sx={{
                color: '#fff',
                width: 40, height: 40,
                '&:hover': { bgcolor: 'rgba(16,185,129,0.3)' },
              }}
            >
              <CreditCard sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Locker">
            <IconButton
              size="medium"
              onClick={(e) => { e.stopPropagation(); onReassignShelf(); }}
              sx={{
                color: '#fff',
                width: 40, height: 40,
                '&:hover': { bgcolor: 'rgba(59,130,246,0.3)' },
              }}
            >
              <Storage sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="medium"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              sx={{
                color: '#fff',
                width: 40, height: 40,
                '&:hover': { bgcolor: 'rgba(239,68,68,0.3)' },
              }}
            >
              <Delete sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* No-photo fallback icon — centered in upper half */}
      {!photoUrl && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '45%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          <Person sx={{ fontSize: 72, color: 'rgba(255,255,255,0.25)' }} />
        </Box>
      )}

      {/* Dark gradient overlay — covers bottom 40% of card */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.3) 90%, transparent 100%)',
        zIndex: 2,
      }} />

      {/* Info content — sits on top of gradient */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2.5,
        zIndex: 3,
      }}>
        {/* Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            mb: 0.5,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '1.2rem',
            letterSpacing: '-0.01em',
          }}
        >
          {athlete.full_name}
        </Typography>

        {/* Gym time + Debt badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.65)',
              textTransform: 'capitalize',
              letterSpacing: 0.5,
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            {athlete.gym_time}
          </Typography>

          {/* Debt badge */}
          {Number(athlete.debt) > 0 && (
            <Chip
              label={`Debt: ${athlete.debt} AFN`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: 'rgba(239,68,68,0.85)',
                color: '#fff',
                '& .MuiChip-label': { px: 1.2 },
              }}
            />
          )}
        </Box>

        {/* Split layout: Info left, Locker right */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mb: 1.5 }}>
          {/* Left: Fee deadline & Contact */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {/* Fee deadline */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <CreditCard sx={{ fontSize: 16, color: accentColor }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.8rem' }}>
                {athlete.fee_deadline_date}
              </Typography>
            </Box>

            {/* Contact */}
            {athlete.contact_number && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 500 }}>
                {athlete.contact_number}
              </Typography>
            )}
          </Box>

          {/* Right: Locker Info */}
          {athleteShelf && (
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
              alignItems: 'flex-end',
              borderLeft: '1px solid rgba(255,255,255,0.15)',
              pl: 2,
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Locker
              </Typography>
              <Chip
                icon={<Storage sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
                label={athleteShelf.shelf_number}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(16,185,129,0.85)',
                  color: '#fff',
                  '& .MuiChip-label': { px: 0.8 },
                }}
              />
              {athleteShelf.locker_end_date && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600 }}>
                  Due: {athleteShelf.locker_end_date}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Status row at bottom - ONE ROW with dot + chip + text */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          pt: 1,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Active status dot */}
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: athlete.is_active ? '#10b981' : '#94a3b8',
            boxShadow: athlete.is_active
              ? '0 0 0 3px rgba(16,185,129,0.3)'
              : '0 0 0 3px rgba(148,163,184,0.3)',
            flexShrink: 0,
          }} />

          {/* Status chip and text in one row */}
          {(() => {
            const days = athlete.days_left;
            let chipSx, chipLabel, textSx, textContent;

            if (days < 0) {
              chipSx = {
                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                height: 26,
                fontSize: '0.75rem',
              };
              chipLabel = 'Overdue';
              textSx = { color: '#ef4444', fontWeight: 600, fontSize: '0.75rem' };
              textContent = `${Math.abs(days)} days ago`;
            } else if (days <= 5) {
              chipSx = {
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                height: 26,
                fontSize: '0.75rem',
              };
              chipLabel = 'Critical';
              textSx = { color: '#f59e0b', fontWeight: 600, fontSize: '0.75rem' };
              textContent = `${days} days left`;
            } else if (days <= 15) {
              chipSx = {
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                height: 26,
                fontSize: '0.75rem',
              };
              chipLabel = 'Warning';
              textSx = { color: '#3b82f6', fontWeight: 600, fontSize: '0.75rem' };
              textContent = `${days} days left`;
            } else {
              chipSx = {
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                height: 26,
                fontSize: '0.75rem',
              };
              chipLabel = 'Active';
              textSx = { color: '#10b981', fontWeight: 600, fontSize: '0.75rem' };
              textContent = `${days} days left`;
            }

            return (
              <>
                <Chip label={chipLabel} size="small" sx={chipSx} />
                <Typography variant="caption" sx={textSx}>
                  {textContent}
                </Typography>
              </>
            );
          })()}
        </Box>
      </Box>
    </Box>
  );
});

export { CARD_HEIGHT, GRID_GAP };
export default AthleteCard;
