import { Box, Skeleton } from '@mui/material';
import React from 'react';
import { CARD_HEIGHT } from './AthleteCard';

/**
 * Skeleton loading component for AthleteCard
 * Displays while data is being fetched
 */
const AthleteCardSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        height: CARD_HEIGHT,
        bgcolor: '#f8fafc',
      }}
    >
      {/* Top section with action buttons skeleton */}
      <Box sx={{
        position: 'absolute',
        top: 14,
        right: 14,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 2,
      }}>
        <Skeleton variant="rounded" width={240} height={52} sx={{ borderRadius: 2.5 }} />
      </Box>

      {/* Main image area skeleton */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height="60%"
        sx={{ position: 'absolute', top: 0 }}
      />

      {/* Bottom info section */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2.5,
        bgcolor: 'rgba(0,0,0,0.05)',
      }}>
        {/* Name skeleton */}
        <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
        
        {/* Gym time skeleton */}
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1.5 }} />
        
        {/* Info row skeleton */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={18} sx={{ mt: 0.5 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width="100%" height={24} sx={{ borderRadius: 1.5 }} />
          </Box>
        </Box>

        {/* Status row skeleton at bottom - ONE ROW */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          pt: 1,
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}>
          <Skeleton variant="circular" width={10} height={10} />
          <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="text" width={70} height={20} />
        </Box>
      </Box>
    </Box>
  );
};

export default AthleteCardSkeleton;
