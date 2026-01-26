import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ChangePasswordProps {
  open: boolean;
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Password changed successfully, logout user
      logout();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Failed to change password');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Lock />
        Change Password
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Current Password"
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <TextField
              value={error}
              fullWidth
              margin="normal"
              error
              helperText={error}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !oldPassword || !newPassword || !confirmPassword}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword;