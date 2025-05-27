'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  User,
  Wrench,
  X,
  Save,
  Loader2,
  ClipboardList
} from 'lucide-react';


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
  const [isTableLoading, setIsTableLoading] = useState(true); 
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
      setIsTableLoading(true); 
      const response = await axios.get('https://hospiwise-backend.onrender.com/api/maintenance-history');
      console.log("response", response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
    } finally {
      setIsTableLoading(false); 
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

  const validateForm = () => {
    const { equipment, maintenanceDate, issue, description, resolution, technician } = form;
    return (
      equipment.id &&
      maintenanceDate &&
      issue &&
      description.trim() &&
      resolution.trim() &&
      technician.trim()
    );
  };
  

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
    if (!validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }
  
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
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Maintenance History</h1>
            </div>
            <button
              onClick={() => handleOpen()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Record
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Maintenance ID</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Equipment</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Issue</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Resolution</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Technician</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isTableLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-gray-600 font-medium">Loading maintenance records...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList className="w-12 h-12 text-gray-300" />
                        <span className="text-gray-500 font-medium">No maintenance records found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="p-4">
                        <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                          {row._id || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium text-gray-800">{row.equipment?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {new Date(row.maintenanceDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200">
                          {row.issue?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-sm text-gray-800 line-clamp-2" title={row.description}>
                          {row.description}
                        </p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-sm text-gray-800 line-clamp-2" title={row.resolution}>
                          {row.resolution}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800">{row.technician}</span>
                        </div>
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
          <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editIndex !== null ? 'Edit' : 'Add'} Maintenance Record
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment</label>
                    <select
                      name="equipment"
                      value={form.equipment.id}
                      onChange={(e) => {
                        const selected = equipmentOptions.find(eq => eq._id === e.target.value);
                        if (selected) {
                          setForm({
                            ...form,
                            equipment: { id: selected._id, name: selected.name },
                          });
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                      aria-label="Equipment"
                      title="Equipment"
                    >
                      <option value="">Select Equipment</option>
                      {equipmentOptions.map((eq) => (
                        <option key={eq._id} value={eq._id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor='maintenanceDate' className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      id="maintenanceDate"
                      type="date"
                      name="maintenanceDate"
                      value={form.maintenanceDate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Issue</label>
                  <select
                    title='Issue'
                    name="issue"
                    value={form.issue}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  >
                    <option value="">Select Issue</option>
                    {Object.entries(issueEnum).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none bg-gradient-to-r from-gray-50 to-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resolution</label>
                  <textarea
                    name="resolution"
                    value={form.resolution}
                    onChange={handleChange}
                    placeholder="Describe how the issue was resolved..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none bg-gradient-to-r from-gray-50 to-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Technician</label>
                  <input
                    type="text"
                    name="technician"
                    value={form.technician}
                    onChange={handleChange}
                    placeholder="Enter technician name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  />
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
      </div>
    </div>
  );
}
