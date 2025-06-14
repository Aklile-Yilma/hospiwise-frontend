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
  ClipboardList,
  AlertTriangle,
  Search,
  BarChart3
} from 'lucide-react';

interface Equipment {
  _id: string;
  name: string;
  type: string;
  location: string;
  serialNumber: string;
}

interface MaintenanceRecord {
  _id: string;
  maintenanceId: string;
  equipment: Equipment;
  issue: string;
  description: string;
  resolution: string;
  technician: string;
  maintenanceDate: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  equipment: {
    name: string;
    id: string;
    type: string;
  };
  maintenanceDate: string;
  issue: string;
  description: string;
  resolution: string;
  technician: string;
}

const API_BASE = 'https://hospiwise-backend.onrender.com/api';

export default function MaintenanceHistoryManager() {
  const [data, setData] = useState<MaintenanceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [equipmentOptions, setEquipmentOptions] = useState<Equipment[]>([]);
  const [availableIssues, setAvailableIssues] = useState<string[]>([]);
  // const [allIssueEnums, setAllIssueEnums] = useState<Record<string, string[]>>({});
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterEquipmentType, setFilterEquipmentType] = useState('');
  const [sortBy, setSortBy] = useState<keyof MaintenanceRecord | 'equipmentName' | 'equipmentType'>('maintenanceDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [form, setForm] = useState<FormData>({
    equipment: {
      name: '',
      id: '',
      type: '',
    },
    maintenanceDate: '',
    issue: '',
    description: '',
    resolution: '',
    technician: '',
  });

  // Fetch maintenance history with optional filters
  const fetchMaintenanceHistory = async () => {
    try {
      setIsTableLoading(true);
      const response = await axios.get(`${API_BASE}/maintenance-history`);
      
      if (response.data.success) {
        setData(response.data.data.records || response.data.data);
      } else {
        setData(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      setData([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  // Fetch equipment list
  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API_BASE}/equipment`);
      setEquipmentOptions(response.data.equipments || response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  // Fetch all issue enums for reference
  const fetchAllIssueEnums = async () => {
    // try {
    //   const response = await axios.get(`${API_BASE}/maintenance-history/issues/all`);
    //   if (response.data.success) {
    //     setAllIssueEnums(response.data.data);
    //   } else {
    //     setAllIssueEnums(response.data);
    //   }
    // } catch (error) {
    //   console.error('Error fetching issue enums:', error);
    // }
  };

  // Fetch valid issues for selected equipment type
  const fetchValidIssuesForEquipmentType = async (equipmentType: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}/maintenance-history/issues/type/${encodeURIComponent(equipmentType)}`
      );
      
      if (response.data.success) {
        setAvailableIssues(response.data.data.validIssues);
      } else if (response.data.validIssues) {
        setAvailableIssues(response.data.validIssues);
      } else {
        setAvailableIssues([]);
      }
    } catch (error) {
      console.error('Error fetching valid issues:', error);
      setAvailableIssues([]);
    }
  };

  useEffect(() => {
    fetchMaintenanceHistory();
    fetchEquipment();
    fetchAllIssueEnums();
  }, []);

  // Update available issues when equipment type changes
  useEffect(() => {
    if (form.equipment.type) {
      fetchValidIssuesForEquipmentType(form.equipment.type);
    } else {
      setAvailableIssues([]);
    }
  }, [form.equipment.type]);

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
      const record = data[index];
      setForm({
        equipment: {
          id: record.equipment._id,
          name: record.equipment.name,
          type: record.equipment.type,
        },
        maintenanceDate: new Date(record.maintenanceDate).toISOString().split('T')[0],
        issue: record.issue,
        description: record.description,
        resolution: record.resolution,
        technician: record.technician,
      });
    } else {
      setForm({
        equipment: {
          name: '',
          id: '',
          type: '',
        },
        maintenanceDate: new Date().toISOString().split('T')[0],
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
    setAvailableIssues([]);
  };

  const handleEquipmentChange = (equipmentId: string) => {
    const selected = equipmentOptions.find(eq => eq._id === equipmentId);
    if (selected) {
      setForm({
        ...form,
        equipment: {
          id: selected._id,
          name: selected.name,
          type: selected.type,
        },
        issue: '', // Reset issue when equipment changes
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        equipment: form.equipment.id,
        issue: form.issue,
        description: form.description,
        resolution: form.resolution,
        technician: form.technician,
        maintenanceDate: form.maintenanceDate,
      };

      if (editIndex !== null) {
        // Update existing record
        const response = await axios.put(
          `${API_BASE}/maintenance-history/${data[editIndex]._id}`,
          payload
        );

        const updatedData = [...data];
        updatedData[editIndex] = response.data.data || response.data;
        setData(updatedData);
      } else {
        // Add new record
        const response = await axios.post(`${API_BASE}/maintenance-history`, payload);
        
        const newRecord = response.data.data || response.data;
        setData([newRecord, ...data]);
      }

      handleClose();
    } catch (error: any) {
      console.error('Error saving maintenance history:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save maintenance record';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await axios.delete(`${API_BASE}/maintenance-history/${data[index]._id}`);
        const updated = data.filter((_, i) => i !== index);
        setData(updated);
      } catch (error) {
        console.error('Error deleting maintenance history:', error);
        alert('Failed to delete maintenance record');
      }
    }
  };

  // Filter data based on search and filter criteria
  const filteredData = data.filter(record => {
    const matchesSearch = 
      record.maintenanceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.issue?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTechnician = !filterTechnician || 
      record.technician?.toLowerCase().includes(filterTechnician.toLowerCase());

    const matchesEquipmentType = !filterEquipmentType || 
      record.equipment?.type === filterEquipmentType;

    return matchesSearch && matchesTechnician && matchesEquipmentType;
  }).sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'maintenanceDate':
        aValue = new Date(a.maintenanceDate);
        bValue = new Date(b.maintenanceDate);
        break;
      case 'maintenanceId':
        aValue = a.maintenanceId || a._id;
        bValue = b.maintenanceId || b._id;
        break;
      case 'equipmentName':
        aValue = a.equipment?.name?.toLowerCase() || '';
        bValue = b.equipment?.name?.toLowerCase() || '';
        break;
      case 'equipmentType':
        aValue = a.equipment?.type?.toLowerCase() || '';
        bValue = b.equipment?.type?.toLowerCase() || '';
        break;
      case 'issue':
        aValue = a.issue?.toLowerCase() || '';
        bValue = b.issue?.toLowerCase() || '';
        break;
      case 'technician':
        aValue = a.technician?.toLowerCase() || '';
        bValue = b.technician?.toLowerCase() || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a[sortBy as keyof MaintenanceRecord];
        bValue = b[sortBy as keyof MaintenanceRecord];
    }

    // Handle date comparison
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    // Handle other types
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get unique technicians and equipment types for filters
  const uniqueTechnicians = [...new Set(data.map(record => record.technician))].filter(Boolean);
  const uniqueEquipmentTypes = [...new Set(data.map(record => record.equipment?.type))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Maintenance History</h1>
                <p className="text-gray-600 mt-1">
                  {filteredData.length} of {data.length} records
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpen()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Record
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Technicians</option>
              {uniqueTechnicians.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>

            <select
              value={filterEquipmentType}
              onChange={(e) => setFilterEquipmentType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Equipment Types</option>
              {uniqueEquipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
          </div>
        </div> */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Technicians</option>
              {uniqueTechnicians.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>

            <select
              value={filterEquipmentType}
              onChange={(e) => setFilterEquipmentType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Equipment Types</option>
              {uniqueEquipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as keyof MaintenanceRecord)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="maintenanceDate">Sort by Date</option>
              <option value="maintenanceId">Sort by ID</option>
              <option value="equipmentName">Sort by Equipment</option>
              <option value="equipmentType">Sort by Type</option>
              <option value="issue">Sort by Issue</option>
              <option value="technician">Sort by Technician</option>
              <option value="createdAt">Sort by Created</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Results Summary and Clear Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {filteredData.length} of {data.length} maintenance records
              {searchTerm && (
                <span className="ml-1">
                  matching "<span className="font-medium text-indigo-600">{searchTerm}</span>"
                </span>
              )}
            </div>
            
            {(searchTerm || filterTechnician || filterEquipmentType) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterTechnician('');
                  setFilterEquipmentType('');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 border border-gray-300 rounded-lg hover:border-indigo-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Maintenance ID</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Equipment</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Issue</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Technician</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead> */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'maintenanceId') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('maintenanceId');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Maintenance ID
                      {sortBy === 'maintenanceId' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'equipmentName') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('equipmentName');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Equipment
                      {sortBy === 'equipmentName' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'equipmentType') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('equipmentType');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {sortBy === 'equipmentType' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'maintenanceDate') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('maintenanceDate');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortBy === 'maintenanceDate' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'issue') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('issue');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Issue
                      {sortBy === 'issue' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'technician') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('technician');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Technician
                      {sortBy === 'technician' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
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
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList className="w-12 h-12 text-gray-300" />
                        <span className="text-gray-500 font-medium">
                          {data.length === 0 ? 'No maintenance records found' : 'No records match your filters'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="p-4">
                        <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                          {row.maintenanceId || row._id?.slice(-8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-indigo-600" />
                          <div>
                            <span className="font-medium text-gray-800">{row.equipment?.name || 'N/A'}</span>
                            <div className="text-xs text-gray-500">{row.equipment?.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {row.equipment?.type || 'N/A'}
                        </span>
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
                          {row.issue?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-sm text-gray-800 line-clamp-2" title={row.description}>
                          {row.description}
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
                            onClick={() => handleOpen(data.findIndex(d => d._id === row._id))}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(data.findIndex(d => d._id === row._id))}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Equipment *
                    </label>
                    <select
                      value={form.equipment.id}
                      onChange={(e) => handleEquipmentChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                      required
                    >
                      <option value="">Select Equipment</option>
                      {equipmentOptions.map((eq) => (
                        <option key={eq._id} value={eq._id}>
                          {eq.name} ({eq.type})
                        </option>
                      ))}
                    </select>
                    {form.equipment.type && (
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {form.equipment.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="maintenanceDate" className="block text-sm font-semibold text-gray-700 mb-2">
                      Maintenance Date *
                    </label>
                    <input
                      id='maintenanceDate'
                      type="date"
                      value={form.maintenanceDate}
                      onChange={(e) => setForm({...form, maintenanceDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Type *
                  </label>
                  <select
                    value={form.issue}
                    onChange={(e) => setForm({...form, issue: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    disabled={!form.equipment.type}
                    required
                  >
                    <option value="">
                      {form.equipment.type ? 'Select Issue' : 'Select equipment first'}
                    </option>
                    {availableIssues.map((issue) => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))}
                  </select>
                  {form.equipment.type && availableIssues.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Loading issues for {form.equipment.type}...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Problem Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none bg-gradient-to-r from-gray-50 to-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resolution *
                  </label>
                  <textarea
                    value={form.resolution}
                    onChange={(e) => setForm({...form, resolution: e.target.value})}
                    placeholder="Describe how the issue was resolved..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none bg-gradient-to-r from-gray-50 to-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Technician Name *
                  </label>
                  <input
                    type="text"
                    value={form.technician}
                    onChange={(e) => setForm({...form, technician: e.target.value})}
                    placeholder="Enter technician name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateForm()}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editIndex !== null ? 'Update' : 'Add'} Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}