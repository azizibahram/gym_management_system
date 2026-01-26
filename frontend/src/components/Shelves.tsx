import { Add, Delete, Edit } from '@mui/icons-material';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
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

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8000/api/shelves/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShelves(response.data);
  };

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

  const totalShelves = shelves.length;
  const availableShelves = shelves.filter(s => s.status === 'available').length;
  const assignedShelves = shelves.filter(s => s.status === 'assigned').length;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Shelf Management
        <span style={{ marginLeft: '16px' }}>
          <span style={{
            backgroundColor: '#2196f3',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            marginRight: '8px'
          }}>
            {totalShelves} Total
          </span>
          <span style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            marginRight: '8px'
          }}>
            {availableShelves} Available
          </span>
          <span style={{
            backgroundColor: '#ff9800',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px'
          }}>
            {assignedShelves} Assigned
          </span>
        </span>
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Create Shelf
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shelf Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned Athlete</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shelves.map((shelf) => (
              <TableRow key={shelf.id} hover>
                <TableCell>{shelf.shelf_number}</TableCell>
                <TableCell>
                  <span style={{
                    color: shelf.status === 'available' ? '#4caf50' : '#ff9800',
                    fontWeight: 'bold'
                  }}>
                    {shelf.status}
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
        <DialogTitle>{editing ? 'Edit Shelf' : 'Create Shelf'}</DialogTitle>
        <DialogContent>
          <TextField label="Shelf Number" value={shelfNumber} onChange={(e) => setShelfNumber(e.target.value)} fullWidth margin="normal" required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Shelves;