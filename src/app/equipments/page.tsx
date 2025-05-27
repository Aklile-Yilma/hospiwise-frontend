'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

export default function EquipmentManager() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', serialNumber: '', location: '', status: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchEquipment = async () => {
    try {
      setIsTableLoading(true);
      const response = await axios.get('https://hospiwise-backend.onrender.com/api/equipment');
      setEquipmentList(response.data.equipments);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleOpen = (index: number | null = null) => {
    setEditIndex(index);
    if (index !== null) {
      setForm(equipmentList[index]);
    } else {
      setForm({ name: '', serialNumber: '', location: '', status: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.serialNumber.trim()) {
      alert('Please fill in the required fields.');
      return;
    }

    setIsLoading(true);
    try {
      if (editIndex !== null) {
        const updated = await axios.put(`https://hospiwise-backend.onrender.com/api/equipment/${equipmentList[editIndex]._id}`, form);
        const updatedList = [...equipmentList];
        updatedList[editIndex] = updated.data;
        setEquipmentList(updatedList);
        setSnackbar({ open: true, message: 'Equipment updated!', severity: 'success' });
      } else {
        const created = await axios.post(`https://hospiwise-backend.onrender.com/api/equipment`, form);
        setEquipmentList([...equipmentList, created.data]);
        setSnackbar({ open: true, message: 'Equipment added!', severity: 'success' });
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      setSnackbar({ open: true, message: 'Failed to save equipment.', severity: 'error' });
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await axios.delete(`https://hospiwise-backend.onrender.com/api/equipment/${equipmentList[index]._id}`);
      const updated = [...equipmentList];
      updated.splice(index, 1);
      setEquipmentList(updated);
      setSnackbar({ open: true, message: 'Equipment deleted!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setSnackbar({ open: true, message: 'Failed to delete equipment.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
      <Container maxWidth={"xl"}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Equipment Manager</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Equipment
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipment ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isTableLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                equipmentList.map((eq, index) => (
                  <TableRow key={eq._id}>
                    <TableCell>{eq._id}</TableCell>
                    <TableCell>{eq.name}</TableCell>
                    <TableCell>{eq.serialNumber}</TableCell>
                    <TableCell>{eq.location}</TableCell>
                    <TableCell>{eq.status}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpen(index)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(index)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>{editIndex !== null ? 'Edit' : 'Add'} Equipment</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Serial Number"
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
              />
            <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
                >
                <MenuItem value="Operational">Operational</MenuItem>
                <MenuItem value="Under maintenance">Under maintenance</MenuItem>
                <MenuItem value="Out of order">Out of order</MenuItem>
            </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : editIndex !== null ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snackbar.open}  autoHideDuration={3000} onClose={handleSnackbarClose}>
          <MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity as any} sx={{ width: '100%' }}>
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Container>
    </Box>
  );
}
