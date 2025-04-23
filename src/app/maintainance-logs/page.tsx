'use client';
import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

const issueEnum: Record<string, string> = {
  OVERHEATING: 'Overheating - The equipment is generating excessive heat and may shut down.',
  BATTERY_FAILURE: 'Battery failure - The equipment fails to operate due to a dead or faulty battery.',
  DISPLAY_ERROR: 'Display error - The screen is not displaying any information or has artifacts.',
  NETWORK_ISSUE: 'Network issue - The equipment cannot connect to the network or server.',
  MECHANICAL_FAILURE: 'Mechanical failure - A mechanical part of the equipment is malfunctioning.',
  OTHER: 'Other - Any other unclassified issue.',
};

const EQUIPMENT_ID = "67fa68a76e0b0b9380f599ea"

export default function MaintenanceHistoryManager() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [form, setForm] = useState({
    equipment: {
      name: '',
      id: '',
    },
    maintenanceDate: '',
    issue: '',
    description: '',
    resolution: '',
    technician: '',
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const fetchMaintenanceHistory = async () => {
    try {
      const response = await axios.get('https://hospiwise-backend.onrender.com/api/maintenance-history');
      console.log("response", response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('https://hospiwise-backend.onrender.com/api/equipment');
      setEquipmentOptions(response.data.equipments);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  // Fetch equipment list
  useEffect(() => {
    fetchMaintenanceHistory();
    fetchEquipment();
  }, []);


  const handleOpen = (index: number | null = null) => {
    setEditIndex(index);
    if (index !== null) {
      // setForm({ ...data[index] });
      const record = data[index];
      setForm({
        equipment: record.equipment,
        maintenanceDate: new Date(record.maintenanceDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        issue: record.issue,
        description: record.description,
        resolution: record.resolution,
        technician: record.technician,
      });
    } else {
      setForm({
        equipment: {
          name: '',
          id: ''
        },
        maintenanceDate: '',
        issue: '',
        description: '',
        resolution: '',
        technician: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'equipment') {
      setForm({
        ...form,
        equipment: {
          ...form.equipment,
          name: e.target.value, // Update equipment name
        },
      });
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Start loading
    try {
      if (editIndex !== null) {
        // Update existing record
        const updatedData = {
          ...form,
          equipment: form.equipment.id, // Send only the `id` of the equipment (ObjectId)
        };

        const updatedHistory = await axios.put(
          `https://hospiwise-backend.onrender.com/api/maintenance-history/${data[editIndex]._id}`,
          updatedData
        );

        const updatedDataState = [...data];
        updatedDataState[editIndex] = updatedHistory.data;
        setData(updatedDataState);
      } else {
        // Add new record
        const newRecord = await axios.post(
          `https://hospiwise-backend.onrender.com/api/maintenance-history/${EQUIPMENT_ID}`,
          {
            ...form,
            equipment: EQUIPMENT_ID,
          }
        );
        setData([...data, newRecord.data]);
      }
    } catch (error) {
      console.error('Error updating or adding maintenance history:', error);
    } finally {
      setIsLoading(false); // Stop loading
      handleClose();
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`https://hospiwise-backend.onrender.com/api/maintenance-history/${data[index]._id}`);
        const updated = [...data];
        updated.splice(index, 1);
        setData(updated);
      } catch (error) {
        console.error('Error deleting maintenance history:', error);
      }
    }
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f9f9f9', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Maintenance History</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Record
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: '75vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Issue</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Resolution</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.equipment?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(row.maintenanceDate).toLocaleDateString()}</TableCell>
                  <TableCell>{issueEnum[row.issue]}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.resolution}</TableCell>
                  <TableCell>{row.technician}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(index)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(index)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for Add/Edit */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{editIndex !== null ? 'Edit' : 'Add'} Maintenance Record</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {/* <TextField
                label="Equipment"
                name="equipment"
                value={form.equipment?.name || ''}
                onChange={handleChange}
                fullWidth
              /> */}
              <TextField
                select
                label="Equipment"
                name="equipment"
                value={form.equipment.id || ''}
                onChange={(e) => {
                  const selected = equipmentOptions.find(eq => eq._id === e.target.value);
                  if (selected) {
                    setForm({
                      ...form,
                      equipment: {
                        id: selected._id,
                        name: selected.name,
                      },
                    });
                  }
                }}
                fullWidth
              >
                {equipmentOptions.map((eq) => (
                  <MenuItem key={eq._id} value={eq._id}>
                    {eq.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date"
                name="maintenanceDate"
                type="date"
                value={form.maintenanceDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Issue"
                name="issue"
                value={form.issue}
                onChange={handleChange}
                fullWidth
              >
                {Object.entries(issueEnum).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
              />
              <TextField
                label="Resolution"
                name="resolution"
                value={form.resolution}
                onChange={handleChange}
                fullWidth
                multiline
              />
              <TextField
                label="Technician"
                name="technician"
                value={form.technician}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : editIndex !== null ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
