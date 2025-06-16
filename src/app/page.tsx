"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import {
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';

// TypeScript interfaces
interface Equipment {
  _id: string;
  id: string;
  type: string;
  name: string;
  serialNo: string;
  location: string;
  status: 'Operational' | 'Under maintenance' | 'Out of order';
  manualLink?: string;
  imageLink?: string;
  installationDate: string;
  manufacturer: string;
  modelType: string;
  operatingHours: number;
  lastMaintenanceDate?: string;
  createdAt: string;
}

interface MaintenanceRecord {
  _id: string;
  maintenanceId: string;
  equipment: {
    _id: string;
    name: string;
    location: string;
    type: string;
  };
  issue: string;
  description: string;
  resolution: string;
  technician: string;
  maintenanceDate: string;
  createdAt: string;
  updatedAt: string;
}

interface EquipmentByType {
  name: string;
  count: number;
  operational: number;
  maintenance: number;
  outOfOrder: number;
}

interface StatusOverview {
  name: string;
  value: number;
  color: string;
}

interface MaintenanceByMonth {
  month: string;
  count: number;
  cost: number;
}

interface LocationDistribution {
  location: string;
  count: number;
}

interface TopIssue {
  issue: string;
  count: number;
}

interface RecentAlert {
  id: string;
  equipment: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
}

interface EquipmentAge {
  ageRange: string;
  count: number;
}

interface MaintenanceFrequency {
  equipmentType: string;
  avgDaysBetweenMaintenance: number;
  maintenanceCount: number;
}

interface DashboardData {
  equipmentByType: EquipmentByType[];
  statusOverview: StatusOverview[];
  maintenanceByMonth: MaintenanceByMonth[];
  locationDistribution: LocationDistribution[];
  topIssues: TopIssue[];
  recentAlerts: RecentAlert[];
  equipmentAge: EquipmentAge[];
  maintenanceFrequency: MaintenanceFrequency[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
}

interface AlertBadgeProps {
  severity: 'high' | 'medium' | 'low';
}

// API Base URL
const API_BASE = 'https://hospiwise-backend.onrender.com/api';

// Process equipment age data
const processEquipmentAge = (equipments: Equipment[]): EquipmentAge[] => {
  const ageCounts = {
    '0-1 years': 0,
    '1-3 years': 0,
    '3-5 years': 0,
    '5-10 years': 0,
    '10+ years': 0
  };

  const currentDate = new Date();
  
  equipments.forEach((eq: Equipment) => {
    const installDate = new Date(eq.installationDate);
    const ageInYears = (currentDate.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageInYears <= 1) {
      ageCounts['0-1 years']++;
    } else if (ageInYears <= 3) {
      ageCounts['1-3 years']++;
    } else if (ageInYears <= 5) {
      ageCounts['3-5 years']++;
    } else if (ageInYears <= 10) {
      ageCounts['5-10 years']++;
    } else {
      ageCounts['10+ years']++;
    }
  });

  return Object.entries(ageCounts).map(([ageRange, count]) => ({
    ageRange,
    count
  }));
};

// Process maintenance frequency data
const processMaintenanceFrequency = (equipments: Equipment[], maintenanceHistory: MaintenanceRecord[]): MaintenanceFrequency[] => {
  const frequencyData: { [key: string]: { totalDays: number; count: number; maintenanceCount: number } } = {};
  
  equipments.forEach((eq: Equipment) => {
    if (!frequencyData[eq.type]) {
      frequencyData[eq.type] = { totalDays: 0, count: 0, maintenanceCount: 0 };
    }
    
    const installDate = new Date(eq.installationDate);
    const lastMaintenance = eq.lastMaintenanceDate ? new Date(eq.lastMaintenanceDate) : null;
    const currentDate = new Date();
    
    if (lastMaintenance) {
      const daysSinceInstall = Math.floor((lastMaintenance.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
      frequencyData[eq.type].totalDays += daysSinceInstall;
    } else {
      const daysSinceInstall = Math.floor((currentDate.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
      frequencyData[eq.type].totalDays += daysSinceInstall;
    }
    
    frequencyData[eq.type].count++;
  });

  // Count maintenance records per equipment type
  maintenanceHistory.forEach((record: MaintenanceRecord) => {
    const equipmentType = record.equipment.type;
    if (frequencyData[equipmentType]) {
      frequencyData[equipmentType].maintenanceCount++;
    }
  });

  return Object.entries(frequencyData).map(([equipmentType, data]) => ({
    equipmentType,
    avgDaysBetweenMaintenance: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
    maintenanceCount: data.maintenanceCount
  }));
};

// Process equipment data for dashboard
const processEquipmentData = (equipments: Equipment[]) => {
  // Equipment by type with status breakdown
  const equipmentByType: { [key: string]: EquipmentByType } = {};
  const statusCounts = { 'Operational': 0, 'Under maintenance': 0, 'Out of order': 0 };
  const locationCounts: { [key: string]: number } = {};

  equipments.forEach((eq: Equipment) => {
    // Group by type
    if (!equipmentByType[eq.type]) {
      equipmentByType[eq.type] = {
        name: eq.type,
        count: 0,
        operational: 0,
        maintenance: 0,
        outOfOrder: 0
      };
    }
    
    equipmentByType[eq.type].count++;
    
    // Count by status
    if (eq.status === 'Operational') {
      equipmentByType[eq.type].operational++;
      statusCounts['Operational']++;
    } else if (eq.status === 'Under maintenance') {
      equipmentByType[eq.type].maintenance++;
      statusCounts['Under maintenance']++;
    } else if (eq.status === 'Out of order') {
      equipmentByType[eq.type].outOfOrder++;
      statusCounts['Out of order']++;
    }

    // Count by location
    locationCounts[eq.location] = (locationCounts[eq.location] || 0) + 1;
  });

  const locationDistribution: LocationDistribution[] = Object.entries(locationCounts).map(([location, count]) => ({
    location,
    count
  }));

  return {
    equipmentByType: Object.values(equipmentByType),
    statusOverview: [
      { name: 'Operational', value: statusCounts['Operational'], color: '#10B981' },
      { name: 'Under maintenance', value: statusCounts['Under maintenance'], color: '#F59E0B' },
      { name: 'Out of order', value: statusCounts['Out of order'], color: '#EF4444' }
    ] as StatusOverview[],
    locationDistribution
  };
};

// Process maintenance data for dashboard
const processMaintenanceData = (maintenanceHistory: MaintenanceRecord[]) => {
  const issueCounts: { [key: string]: number } = {};
  const monthlyData: { [key: string]: { count: number; cost: number } } = {};

  maintenanceHistory.forEach((record: MaintenanceRecord) => {
    // Count issues
    issueCounts[record.issue] = (issueCounts[record.issue] || 0) + 1;
    
    // Group by month for trends
    const date = new Date(record.maintenanceDate);
    const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { count: 0, cost: 0 };
    }
    monthlyData[monthKey].count++;
    monthlyData[monthKey].cost += Math.random() * 1000 + 200; // Simulated cost data
  });

  // Get top 5 issues
  const topIssues: TopIssue[] = Object.entries(issueCounts)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Convert monthly data to array
  const maintenanceByMonth: MaintenanceByMonth[] = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      count: data.count,
      cost: Math.round(data.cost)
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Last 6 months

  return {
    topIssues,
    maintenanceByMonth
  };
};

// Generate recent alerts based on equipment data
const generateRecentAlerts = (equipments: Equipment[]): RecentAlert[] => {
  const alerts: RecentAlert[] = [];
  const currentDate = new Date();

  equipments.forEach((eq: Equipment) => {
    // Check for overdue maintenance (equipment installed more than 6 months ago with no recent maintenance)
    const installDate = new Date(eq.installationDate);
    const lastMaintenance = eq.lastMaintenanceDate ? new Date(eq.lastMaintenanceDate) : installDate;
    const daysSinceLastMaintenance = Math.floor((currentDate.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastMaintenance > 180) { // 6 months
      alerts.push({
        id: eq._id,
        equipment: eq.id || eq.name,
        type: 'Overdue Maintenance',
        severity: 'high',
        date: currentDate.toISOString().split('T')[0]
      });
    } else if (eq.status === 'Under maintenance') {
      alerts.push({
        id: eq._id,
        equipment: eq.id || eq.name,
        type: 'Under Maintenance',
        severity: 'medium',
        date: currentDate.toISOString().split('T')[0]
      });
    } else if (eq.status === 'Out of order') {
      alerts.push({
        id: eq._id,
        equipment: eq.id || eq.name,
        type: 'Out of Service',
        severity: 'high',
        date: currentDate.toISOString().split('T')[0]
      });
    }
  });

  return alerts.slice(0, 4); // Return only the first 4 alerts
};

// Fetch real data from APIs
const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const [equipmentResponse, maintenanceResponse] = await Promise.all([
      fetch(`${API_BASE}/equipment`),
      fetch(`${API_BASE}/maintenance-history`)
    ]);

    if (!equipmentResponse.ok || !maintenanceResponse.ok) {
      throw new Error('Failed to fetch data from APIs');
    }

    const equipmentData = await equipmentResponse.json();
    const maintenanceData = await maintenanceResponse.json();

    const equipments: Equipment[] = equipmentData.equipments || [];
    const maintenanceHistory: MaintenanceRecord[] = Array.isArray(maintenanceData) ? maintenanceData : [];

    // Process the data
    const processedEquipmentData = processEquipmentData(equipments);
    const processedMaintenanceData = processMaintenanceData(maintenanceHistory);
    const equipmentAge = processEquipmentAge(equipments);
    const maintenanceFrequency = processMaintenanceFrequency(equipments, maintenanceHistory);
    const recentAlerts = generateRecentAlerts(equipments);

    return {
      ...processedEquipmentData,
      ...processedMaintenanceData,
      equipmentAge,
      maintenanceFrequency,
      recentAlerts
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return empty data structure if APIs fail
    return {
      equipmentByType: [],
      statusOverview: [
        { name: 'Operational', value: 0, color: '#10B981' },
        { name: 'Under maintenance', value: 0, color: '#F59E0B' },
        { name: 'Out of order', value: 0, color: '#EF4444' }
      ],
      maintenanceByMonth: [],
      locationDistribution: [],
      equipmentAge: [],
      maintenanceFrequency: [],
      topIssues: [],
      recentAlerts: []
    };
  }
};

export default function DashboardAnalytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('6months');

  useEffect(() => {
    // Fetch real data from APIs
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set empty data if there's an error
        setData({
          equipmentByType: [],
          statusOverview: [
            { name: 'Operational', value: 0, color: '#10B981' },
            { name: 'Under maintenance', value: 0, color: '#F59E0B' },
            { name: 'Out of order', value: 0, color: '#EF4444' }
          ],
          maintenanceByMonth: [],
          locationDistribution: [],
          equipmentAge: [],
          maintenanceFrequency: [],
          topIssues: [],
          recentAlerts: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalEquipment = data.statusOverview.reduce((sum, item) => sum + item.value, 0);
  const operationalPercentage = totalEquipment > 0 ? ((data.statusOverview[0].value / totalEquipment) * 100).toFixed(1) : '0';

  const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  const AlertBadge: React.FC<AlertBadgeProps> = ({ severity }) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[severity]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Equipment Dashboard</h1>
                <p className="text-gray-600">Real-time overview of hospital equipment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Equipment"
            value={totalEquipment}
            subtitle="Across all departments"
            icon={Settings}
            color="text-indigo-600"
            trend="+5.2% vs last month"
          />
          <StatCard
            title="Operational"
            value={`${operationalPercentage}%`}
            subtitle={`${data.statusOverview[0].value} units active`}
            icon={CheckCircle}
            color="text-green-600"
            trend="+2.1% vs last month"
          />
          <StatCard
            title="Under Maintenance"
            value={data.statusOverview[1].value}
            subtitle="Currently in service"
            icon={Wrench}
            color="text-yellow-600"
          />
          <StatCard
            title="Critical Alerts"
            value={data.recentAlerts.filter(alert => alert.severity === 'high').length}
            subtitle="Require immediate attention"
            icon={AlertTriangle}
            color="text-red-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Equipment Status Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Equipment Status</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusOverview}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.statusOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Equipment by Type */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Equipment by Type</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.equipmentByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="operational" stackId="a" fill="#10B981" name="Operational" />
                  <Bar dataKey="maintenance" stackId="a" fill="#F59E0B" name="Maintenance" />
                  <Bar dataKey="outOfOrder" stackId="a" fill="#EF4444" name="Out of Order" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Equipment Age Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Equipment Age Distribution</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.equipmentAge}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageRange" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" name="Equipment Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maintenance Frequency by Equipment Type */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Maintenance Frequency</h3>
              <span className="text-sm text-gray-500">(Avg days between maintenance)</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.maintenanceFrequency} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="equipmentType" type="category" width={120} fontSize={12} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'avgDaysBetweenMaintenance' ? `${value} days` : value,
                      name === 'avgDaysBetweenMaintenance' ? 'Avg Days Between Maintenance' : 'Maintenance Count'
                    ]}
                  />
                  <Bar dataKey="avgDaysBetweenMaintenance" fill="#10B981" name="Days Between Maintenance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Maintenance Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Maintenance Trends</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.maintenanceByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Maintenance Count" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#ff7300" 
                    strokeWidth={3}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Equipment by Location */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Equipment Distribution</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.locationDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" width={100} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Issues */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Most Common Issues</h3>
            </div>
            <div className="space-y-3">
              {data.topIssues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No maintenance issues recorded yet</p>
                </div>
              ) : (
                data.topIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800">{issue.issue}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{issue.count} cases</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${data.topIssues.length > 0 ? (issue.count / Math.max(...data.topIssues.map(i => i.count))) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Recent Alerts</h3>
            </div>
            <div className="space-y-3">
              {data.recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                data.recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{alert.equipment}</span>
                        <AlertBadge severity={alert.severity} />
                      </div>
                      <p className="text-sm text-gray-600">{alert.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(alert.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {data.recentAlerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                  View All Alerts →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}