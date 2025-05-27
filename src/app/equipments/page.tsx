'use client';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Loader2,
  Settings,
  MapPin,
  Hash,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
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

  const handleChange = (e: React.ChangeEvent<any>) => {
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

    const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Operational': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      'Under maintenance': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertTriangle
      },
      'Out of order': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Operational'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Equipment Manager</h1>
            </div>
            <button
              onClick={() => handleOpen()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Equipment ID</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Serial Number</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isTableLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-gray-600 font-medium">Loading equipment...</span>
                      </div>
                    </td>
                  </tr>
                ) : equipmentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <Settings className="w-12 h-12 text-gray-300" />
                        <span className="text-gray-500 font-medium">No equipment found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  equipmentList.map((eq, index) => (
                    <tr key={eq._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="p-4">
                        <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                          {eq._id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium text-gray-800">{eq.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{eq.serialNumber}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{eq.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(eq.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpen(index)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 bg-opacity-10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editIndex !== null ? 'Edit' : 'Add'} Equipment
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter equipment name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter equipment location"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  >
                    <option value="">Select Status</option>
                    <option value="Operational">Operational</option>
                    <option value="Under maintenance">Under maintenance</option>
                    <option value="Out of order">Out of order</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editIndex !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar */}
        {snackbar.open && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
              snackbar.severity === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {snackbar.severity === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{snackbar.message}</span>
              <button
                title='Delete'
                onClick={handleSnackbarClose}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
