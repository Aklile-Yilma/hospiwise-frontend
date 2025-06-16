"use client"
import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Save,
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
  priority: number;
  notes: Array<{
    note: string;
    addedBy: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  equipment: string;
  issue: string;
  description: string;
  reportedBy: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTechnician: string;
  estimatedRepairTime: string;
  priority: number;
}

interface Props {
  onReportSubmitted: (report: FailureReport) => void;
}

const API_BASE = 'https://hospiwise-backend.onrender.com/api';

export default function FailureReportForm({ onReportSubmitted }: Props) {
  const [equipmentOptions, setEquipmentOptions] = useState<Equipment[]>([]);
  const [availableIssues, setAvailableIssues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const [form, setForm] = useState<FormData>({
    equipment: '',
    issue: '',
    description: '',
    reportedBy: '',
    severity: 'Medium',
    assignedTechnician: '',
    estimatedRepairTime: '',
    priority: 3
  });

  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];

  // Fetch equipment on component mount
  useEffect(() => {
    fetchEquipment();
  }, []);

  // Fetch available issues when equipment is selected
  useEffect(() => {
    if (form.equipment) {
      const selectedEquipment = equipmentOptions.find(eq => eq._id === form.equipment);
      if (selectedEquipment) {
        fetchValidIssues(selectedEquipment.type);
      }
    } else {
      setAvailableIssues([]);
    }
  }, [form.equipment, equipmentOptions]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${API_BASE}/equipment`);
      if (response.ok) {
        const data = await response.json();
        setEquipmentOptions(data.equipments || []);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchValidIssues = async (equipmentType: string) => {
    try {
      const response = await fetch(`${API_BASE}/maintenance-history/issues/type/${encodeURIComponent(equipmentType)}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableIssues(data.validIssues || []);
      }
    } catch (error) {
      console.error('Error fetching valid issues:', error);
      setAvailableIssues([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.equipment || !form.issue || !form.description || !form.reportedBy) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        equipment: form.equipment,
        issue: form.issue,
        description: form.description,
        reportedBy: form.reportedBy,
        severity: form.severity,
        assignedTechnician: form.assignedTechnician || undefined,
        estimatedRepairTime: form.estimatedRepairTime || undefined,
        priority: form.priority
      };

      const response = await fetch(`${API_BASE}/failure-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        onReportSubmitted(result.data);
        resetForm();
        setShowForm(false);
        alert('Failure report submitted successfully!');
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(`Error: ${error.error || 'Failed to submit failure report'}`);
      }
    } catch (error) {
      console.error('Error submitting failure report:', error);
      alert('Failed to submit failure report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      equipment: '',
      issue: '',
      description: '',
      reportedBy: '',
      severity: 'Medium',
      assignedTechnician: '',
      estimatedRepairTime: '',
      priority: 3
    });
    setAvailableIssues([]);
  };

  return (
    <>
      {/* Header with Report Button */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Plus className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Equipment Failure Reports</h1>
              <p className="text-gray-600">Report and track equipment failures</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Report Failure
          </button>
        </div>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Report Equipment Failure</h2>
            <button
               title='a'
              onClick={() => setShowForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipment Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Equipment <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.equipment}
                  onChange={(e) => setForm({...form, equipment: e.target.value, issue: ''})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipmentOptions.map(eq => (
                    <option key={eq._id} value={eq._id}>
                      {eq.name} ({eq.type}) - {eq.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.issue}
                  onChange={(e) => setForm({...form, issue: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={!form.equipment}
                  required
                >
                  <option value="">
                    {form.equipment ? 'Select Issue Type' : 'Select Equipment First'}
                  </option>
                  {availableIssues.map(issue => (
                    <option key={issue} value={issue}>{issue}</option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({...form, severity: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {severityOptions.map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder='Priority'
                  value={form.priority}
                  onChange={(e) => setForm({...form, priority: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Reported By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reported By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.reportedBy}
                  onChange={(e) => setForm({...form, reportedBy: e.target.value})}
                  placeholder="Your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              {/* Assigned Technician */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign to Technician
                </label>
                <input
                  type="text"
                  value={form.assignedTechnician}
                  onChange={(e) => setForm({...form, assignedTechnician: e.target.value})}
                  placeholder="Technician name (optional)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Describe the problem in detail..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                required
              />
            </div>

            {/* Estimated Repair Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Repair Completion
              </label>
              <input
                placeholder='Estimated Repair Time'
                type="datetime-local"
                value={form.estimatedRepairTime}
                onChange={(e) => setForm({...form, estimatedRepairTime: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}