
import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  Settings,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Search,
  Loader2
} from 'lucide-react';

// TypeScript interfaces
interface Equipment {
  _id: string;
  id: string;
  name: string;
  type: string;
  location: string;
  serialNo: string;
}

interface FailureReport {
  _id: string;
  failureId: string;
  equipment: Equipment;
  issue: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'In Progress' | 'Pending Parts' | 'Awaiting Technician' | 'Resolved';
  assignedTechnician?: string;
  estimatedRepairTime?: string;
  actualStartTime?: string;
  priority: number;
  notes: Array<{
    note: string;
    addedBy: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  reports: FailureReport[];
  onReportsUpdate: () => void;
}

const API_BASE = 'https://hospiwise-backend.onrender.com/api';

export default function FailureReportsList({ reports, onReportsUpdate }: Props) {
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [noteAuthor, setNoteAuthor] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterEquipmentType, setFilterEquipmentType] = useState<string>('');

  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['Reported', 'In Progress', 'Pending Parts', 'Awaiting Technician', 'Resolved'];

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/failure-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onReportsUpdate();
      } else {
        const error = await response.json();
        alert(`Error updating status: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleResolve = async (reportId: string) => {
    const resolution = prompt('Enter resolution description:');
    const technician = prompt('Enter technician name:');
    
    if (!resolution || !technician) return;

    try {
      const response = await fetch(`${API_BASE}/failure-reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, technician })
      });

      if (response.ok) {
        onReportsUpdate();
        alert('Failure report resolved and maintenance record created!');
      } else {
        const error = await response.json();
        alert(`Error resolving report: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resolving failure report:', error);
      alert('Failed to resolve failure report');
    }
  };

  const handleAddNote = async (reportId: string) => {
    if (!newNote.trim() || !noteAuthor.trim()) {
      alert('Please enter both note and author name');
      return;
    }

    setIsAddingNote(reportId);
    try {
      const response = await fetch(`${API_BASE}/failure-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addNote: {
            note: newNote,
            addedBy: noteAuthor
          }
        })
      });

      if (response.ok) {
        onReportsUpdate();
        setNewNote('');
        setNoteAuthor('');
      } else {
        const error = await response.json();
        alert(`Error adding note: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setIsAddingNote(null);
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.failureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || report.status === filterStatus;
    const matchesSeverity = !filterSeverity || report.severity === filterSeverity;
    const matchesEquipmentType = !filterEquipmentType || report.equipment.type === filterEquipmentType;

    return matchesSearch && matchesStatus && matchesSeverity && matchesEquipmentType;
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      'Low': 'bg-blue-100 text-blue-800 border-blue-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Critical': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Reported': 'bg-red-100 text-red-800 border-red-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Pending Parts': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Awaiting Technician': 'bg-purple-100 text-purple-800 border-purple-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-600 font-bold';
    if (priority === 3) return 'text-orange-600 font-semibold';
    if (priority === 2) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const uniqueEquipmentTypes = [...new Set(reports.map(r => r.equipment.type))];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterSeverity('');
    setFilterEquipmentType('');
  };

  const hasActiveFilters = searchTerm || filterStatus || filterSeverity || filterEquipmentType;

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Severities</option>
            {severityOptions.map(severity => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </select>

          <select
            value={filterEquipmentType}
            onChange={(e) => setFilterEquipmentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Equipment Types</option>
            {uniqueEquipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {filteredReports.length} of {reports.length} failure reports
            {searchTerm && (
              <span className="ml-1">
                matching "<span className="font-medium text-red-600">{searchTerm}</span>"
              </span>
            )}
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Failure ID</th>
                <th className="text-left p-4 font-semibold text-gray-700">Equipment</th>
                <th className="text-left p-4 font-semibold text-gray-700">Issue</th>
                <th className="text-left p-4 font-semibold text-gray-700">Severity</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Priority</th>
                <th className="text-left p-4 font-semibold text-gray-700">Reported By</th>
                <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-12">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <span className="text-gray-500">
                      {reports.length === 0 ? 'No failure reports found' : 'No reports match your filters'}
                    </span>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:border-red-400 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <React.Fragment key={report._id}>
                    <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200">
                      <td className="p-4">
                        <span className="font-mono text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                          {report.failureId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-800">{report.equipment.name}</span>
                            <div className="text-xs text-gray-500">
                              {report.equipment.type} • {report.equipment.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-800">{report.issue}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={report.status}
                          onChange={(e) => handleUpdateStatus(report._id, e.target.value)}
                          className={`text-xs font-medium rounded-full border px-2 py-1 ${getStatusColor(report.status)} ${report.status === 'Resolved' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          disabled={report.status === 'Resolved'}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm ${getPriorityColor(report.priority)}`}>
                          {report.priority}/5
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800">{report.reportedBy}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {new Date(report.reportedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setShowNotes(showNotes === report._id ? null : report._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                            title="View Details & Notes"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {report.status !== 'Resolved' && (
                            <button
                              onClick={() => handleResolve(report._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                              title="Resolve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Notes Section */}
                    {showNotes === report._id && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <div className="bg-gray-50 border-b border-gray-200 p-6">
                            <div className="space-y-6">
                              {/* Problem Description */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  Problem Description
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                  <p className="text-gray-700 leading-relaxed">{report.description}</p>
                                </div>
                              </div>

                              {/* Notes Section */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-500" />
                                  Progress Notes ({report.notes.length})
                                </h4>
                                
                                {report.notes.length === 0 ? (
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <p className="text-gray-500 text-sm italic">No notes added yet</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {report.notes.map((note, index) => (
                                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <p className="text-gray-700 mb-2">{note.note}</p>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                          <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {note.addedBy}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(note.addedAt).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Add New Note */}
                                {report.status !== 'Resolved' && (
                                  <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-medium text-gray-700 mb-3">Add Progress Note</h5>
                                    <div className="flex gap-3">
                                      <input
                                        type="text"
                                        placeholder="Your name"
                                        value={noteAuthor}
                                        onChange={(e) => setNoteAuthor(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-shrink-0 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Add a progress note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddNote(report._id)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                      <button
                                        onClick={() => handleAddNote(report._id)}
                                        disabled={isAddingNote === report._id}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                      >
                                        {isAddingNote === report._id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          'Add Note'
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Additional Details */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Settings className="w-4 h-4 text-gray-500" />
                                  Additional Details
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Equipment ID:</span>
                                      <span className="ml-2 text-sm text-gray-800 font-mono">{report.equipment.id}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Serial Number:</span>
                                      <span className="ml-2 text-sm text-gray-800">{report.equipment.serialNo}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Priority Level:</span>
                                      <span className={`ml-2 text-sm ${getPriorityColor(report.priority)}`}>
                                        {report.priority}/5
                                      </span>
                                    </div>
                                    {report.assignedTechnician && (
                                      <div>
                                        <span className="text-sm font-medium text-gray-600">Assigned to:</span>
                                        <span className="ml-2 text-sm text-gray-800">{report.assignedTechnician}</span>
                                      </div>
                                    )}
                                    {report.estimatedRepairTime && (
                                      <div>
                                        <span className="text-sm font-medium text-gray-600">Est. Completion:</span>
                                        <span className="ml-2 text-sm text-gray-800">
                                          {new Date(report.estimatedRepairTime).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    {report.actualStartTime && (
                                      <div>
                                        <span className="text-sm font-medium text-gray-600">Work Started:</span>
                                        <span className="ml-2 text-sm text-gray-800">
                                          {new Date(report.actualStartTime).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
              <p className="text-xs text-gray-500">
                {filteredReports.length} visible
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter(r => r.status === 'In Progress').length}
              </p>
              <p className="text-xs text-gray-500">
                Active repairs
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter(r => r.severity === 'Critical' && r.status !== 'Resolved').length}
              </p>
              <p className="text-xs text-gray-500">
                Urgent attention needed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter(r => r.status === 'Resolved').length}
              </p>
              <p className="text-xs text-gray-500">
                {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'Resolved').length / reports.length) * 100) : 0}% completion rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}