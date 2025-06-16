"use client"
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import FailureReportForm from '@/components/report-failure/ReportForm';
import FailureReportsList from '@/components/report-failure/ReportList';



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

const API_BASE = 'https://hospiwise-backend.onrender.com/api';


export default function FailureReportsPage() {
  const [reports, setReports] = useState<FailureReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch failure reports
  const fetchFailureReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/failure-reports`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      
      const data = await response.json();
      setReports(data.success ? data.data : []);
    } catch (err) {
      console.error('Error fetching failure reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load failure reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reports on component mount
  useEffect(() => {
    fetchFailureReports();
  }, []);

  // Handle new report submission
  const handleReportSubmitted = (newReport: FailureReport) => {
    setReports(prevReports => [newReport, ...prevReports]);
  };

  // Handle reports update (for status changes, notes, etc.)
  const handleReportsUpdate = () => {
    fetchFailureReports();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading failure reports...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchFailureReports}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Form Component */}
        <FailureReportForm onReportSubmitted={handleReportSubmitted} />
        
        {/* List Component */}
        <FailureReportsList
          reports={reports} 
          onReportsUpdate={handleReportsUpdate} 
        />
    </div>
    </div>
  )
}