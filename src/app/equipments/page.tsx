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
  XCircle,
  Building,
  Clock, 
  FolderOpen
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function EquipmentManager() {
  const router = useRouter()
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState({ 
    type: '', 
    serialNo: '', 
    location: '', 
    status: '',
    manualLink: '',
    imageLink: '',
    installationDate: '',
    manufacturer: '',
    modelType: '',
    operatingHours: 0,
    name: "abc"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // 1. Add new state variables after existing useState declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredEquipmentList, setFilteredEquipmentList] = useState<any[]>([]);

  const equipmentTypes = [
  'Defibrillator', 
  'Infusion pump', 
  'Patient monitor', 
  'Suction machine',
  'ULTRASOUND',
  'CTScanner', 
  'MRI',
  'Anesthesia Machine',
  'XRAY'
];
  const statusOptions = ['Operational', 'Under maintenance', 'Out of order'];

  // Manufacturer and model data organized by equipment type
const equipmentData = {
  'Defibrillator': {
    manufacturers: {
      'Philips': ['HeartStart XL+', 'HeartStart FRx', 'HeartStart MRx', 'X Series'],
      'Medtronic': ['LIFEPAK 15', 'LIFEPAK 20e', 'LIFEPAK CR Plus', 'LIFEPAK 1000'],
      'Zoll': ['AED Plus', 'AED Pro', 'X Series', 'R Series'],
      'Stryker': ['LIFEPAK 15', 'LIFEPAK 12', 'samaritan PAD'],
      'Cardiac Science': ['Powerheart G5', 'Powerheart G3', 'Survivalink']
    }
  },
  'Infusion pump': {
    manufacturers: {
      'B. Braun': ['Perfusor Space', 'Infusomat Space', 'Perfusor FM', 'Outlook ES'],
      'Baxter': ['Sigma Spectrum', 'Colleague 3', 'AS50', 'Flo-Gard 6301'],
      'BD': ['Alaris PC', 'Alaris VP', 'Alaris CC', 'Alaris GH'],
      'Fresenius Kabi': ['Agilia', 'Volumat MC', 'Injectomat MC'],
      'ICU Medical': ['Plum A+', 'LifeCare PCA', 'MedFusion 4000']
    }
  },
  'Patient monitor': {
    manufacturers: {
      'Philips': ['IntelliVue MX800', 'IntelliVue MX700', 'IntelliVue MP70', 'SureSigns VS4'],
      'GE Healthcare': ['CARESCAPE B850', 'CARESCAPE B650', 'Dash 4000', 'Dash 3000'],
      'Mindray': ['BeneVision N1', 'BeneVision N15', 'BeneVision N22', 'T1'],
      'Nihon Kohden': ['BSM-6701', 'BSM-2401', 'Life Scope TR', 'Life Scope VS'],
      'Masimo': ['Root', 'Radius-7', 'Radical-7', 'Pronto-7']
    }
  },
  'Suction machine': {
    manufacturers: {
      'Medela': ['Dominant 50', 'Basic 31', 'Clario', 'Vario 18'],
      'Drive Medical': ['Heavy Duty', 'Portable', '18600-AC', '18601-D'],
      'Laerdal': ['LCSU 4', 'LSU 4000', 'Compact Suction Unit'],
      'Weinmann': ['ACCUVAC Rescue', 'ACCUVAC Pro', 'WM 27310'],
      'Ohio Medical': ['Hi-Flo', 'Suction Max', 'Portable Aspirator']
    }
  },
  'ULTRASOUND': {
    manufacturers: {
      'GE Healthcare': ['Logiq E10', 'Logiq S8', 'Voluson E10', 'Venue Series'],
      'Philips': ['EPIQ Elite', 'EPIQ CVx', 'Affiniti', 'ClearVue'],
      'Siemens': ['Acuson Sequoia', 'Acuson Juniper', 'Acuson P500', 'Acuson NX3'],
      'Canon Medical': ['Aplio i800', 'Aplio a550', 'Xario', 'Nemio'],
      'Mindray': ['Resona 7', 'DC-8', 'M9', 'TE7']
    }
  },
  'CTScanner': {
    manufacturers: {
      'GE Healthcare': ['Revolution CT', 'Discovery CT750 HD', 'Optima CT540', 'BrightSpeed'],
      'Siemens': ['SOMATOM Force', 'SOMATOM Drive', 'SOMATOM go.', 'SOMATOM Edge'],
      'Philips': ['Ingenuity CT', 'iCT Elite', 'Brilliance CT', 'MX8000'],
      'Canon Medical': ['Aquilion ONE', 'Aquilion Prime', 'Aquilion Lightning', 'Alexion'],
      'Hitachi': ['Scenaria', 'Supria', 'Presto']
    }
  },
  'MRI': {
    manufacturers: {
      'Siemens': ['MAGNETOM Vida', 'MAGNETOM Sola', 'MAGNETOM Altea', 'MAGNETOM Aera'],
      'GE Healthcare': ['SIGNA Premier', 'SIGNA Artist', 'SIGNA Explorer', 'Optima MR450w'],
      'Philips': ['Ingenia Elition', 'Ingenia', 'Achieva', 'Panorama'],
      'Canon Medical': ['Vantage Galan', 'Vantage Orian', 'Vantage Titan', 'Atlas'],
      'Hitachi': ['Echelon', 'Oasis', 'Airis']
    }
  },
  'Anesthesia Machine': {
    manufacturers: {
      'GE Healthcare': ['Aisys CS2', 'Avance CS2', 'Aespire 7900', 'Carestation 650'],
      'Dräger': ['Perseus A500', 'Fabius MRI', 'Primus', 'Apollo'],
      'Mindray': ['WATO EX-65', 'WATO EX-55', 'WATO EX-35', 'A7'],
      'Philips': ['IntelliVue', 'Trilogy Evo', 'V60', 'E30'],
      'Getinge': ['FLOW-i', 'FLOW-e', 'SERVO-i', 'SERVO-n']
    }
  },
  'XRAY': {
    manufacturers: {
      'GE Healthcare': ['Discovery XR656', 'Definium 8000', 'AMX 4+', 'Brivo XR515'],
      'Siemens': ['Ysio Max', 'Ysio', 'Multix Impact', 'Multix Pro'],
      'Philips': ['DigitalDiagnost C90', 'MobileDiagnost wDR', 'BuckyDiagnost', 'CombiDiagnost'],
      'Canon Medical': ['CXDI Series', 'CALNEO Series', 'RADREX Series', 'ZEXIRA Series'],
      'Fujifilm': ['FDR D-EVO', 'FDR Go', 'FDR Smart X', 'FCR Prima']
    }
  }
};

  // Get manufacturers for selected equipment type
  const getManufacturers = (type: string) => {
    return type ? Object.keys(equipmentData[type as keyof typeof equipmentData]?.manufacturers || {}) : [];
  };

  // Get models for selected manufacturer and type
  const getModels = (type: string, manufacturer: string) => {
    if (!type || !manufacturer) return [];
    const manufacturers = equipmentData[type as keyof typeof equipmentData]?.manufacturers;
    if (!manufacturers) return [];
    return (manufacturers as Record<string, string[]>)[manufacturer] || [];
  };

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

  useEffect(() => {
  let filtered = [...equipmentList];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(eq =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply type filter
  if (filterType) {
    filtered = filtered.filter(eq => eq.type === filterType);
  }

  // Apply status filter
  if (filterStatus) {
    filtered = filtered.filter(eq => eq.status === filterStatus);
  }

  // Apply location filter
  if (filterLocation) {
    filtered = filtered.filter(eq => eq.location === filterLocation);
  }

  // Apply manufacturer filter
  if (filterManufacturer) {
    filtered = filtered.filter(eq => eq.manufacturer === filterManufacturer);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle numeric values
    if (sortBy === 'operatingHours') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    // Handle date values
    if (sortBy === 'installationDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string values
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  setFilteredEquipmentList(filtered);
}, [equipmentList, searchTerm, filterType, filterStatus, filterLocation, filterManufacturer, sortBy, sortOrder]);


  const handleOpen = (index: number | null = null) => {
    setEditIndex(index);
    if (index !== null) {
      const equipment = equipmentList[index];
      setForm({
        type: equipment.type || '',
        serialNo: equipment.serialNo || equipment.serialNumber || '', // Handle both old and new field names
        location: equipment.location || '',
        status: equipment.status || '',
        manualLink: equipment.manualLink || '',
        imageLink: equipment.imageLink || '',
        installationDate: equipment.installationDate ? equipment.installationDate.split('T')[0] : '',
        manufacturer: equipment.manufacturer || '',
        modelType: equipment.modelType || '',
        operatingHours: equipment.operatingHours || 0,
        name: equipment.name || ''
      });
    } else {
      setForm({ 
        type: '', 
        serialNo: '', 
        location: '', 
        status: '',
        manualLink: '',
        imageLink: '',
        installationDate: '',
        manufacturer: '',
        modelType: '',
        operatingHours: 0,
        name: "abc"
      });
    }
    setOpen(true);
  };

  const handleOpenDetails = (id: string) => {
    router.push(`/equipments/${id}`);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type } = e.target;
    const updatedForm = { 
      ...form, 
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value 
    };

    // Clear dependent fields when parent fields change
    if (name === 'type') {
      updatedForm.manufacturer = '';
      updatedForm.modelType = '';
    } else if (name === 'manufacturer') {
      updatedForm.modelType = '';
    }

    setForm(updatedForm);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.type.trim() || !form.serialNo.trim() || !form.location.trim() || 
        !form.status.trim() || !form.installationDate || !form.manufacturer.trim() || !form.modelType.trim()) {
      alert('Please fill in all required fields.');
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

  const handleHeaderClick = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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

  const getTypeIcon = (type: string) => {
    const icons = {
      'Defibrillator': '⚡',
      'Infusion pump': '💉',
      'Patient monitor': '📊',
      'Suction machine': '🔄',
      'ULTRASOUND': '🔊',
      'CTScanner': '⚕️',
      'MRI': '🧲',
      'Anesthesia Machine': '😷',
      'XRAY': '☢️'
    };
    return icons[type as keyof typeof icons] || '⚙️';
  };

  const getUniqueLocations = () => {
    return [...new Set(equipmentList.map(eq => eq.location))].sort();
  };

  const getUniqueManufacturers = () => {
    return [...new Set(equipmentList.map(eq => eq.manufacturer))].sort();
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Equipment
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, ID, serial number, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Equipment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Types</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Locations</option>
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Manufacturer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <select
                value={filterManufacturer}
                onChange={(e) => setFilterManufacturer(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Manufacturers</option>
                {getUniqueManufacturers().map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
                <option value="location">Location</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="operatingHours">Operating Hours</option>
                <option value="installationDate">Installation Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Results Summary and Clear Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {filteredEquipmentList.length} of {equipmentList.length} equipment
              {searchTerm && (
                <span className="ml-1">
                  matching "<span className="font-medium text-indigo-600">{searchTerm}</span>"
                </span>
              )}
            </div>
            
            {(searchTerm || filterType || filterStatus || filterLocation || filterManufacturer) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                  setFilterLocation('');
                  setFilterManufacturer('');
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
                  <th className="text-left p-4 font-semibold text-gray-700">Equipment ID</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Serial Number</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Manufacturer</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Operating Hours</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead> */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('id')}
                  >
                    <div className="flex items-center gap-2">
                      Equipment ID
                      {sortBy === 'id' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('type')}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {sortBy === 'type' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortBy === 'name' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('serialNo')}
                  >
                    <div className="flex items-center gap-2">
                      Serial Number
                      {sortBy === 'serialNo' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('location')}
                  >
                    <div className="flex items-center gap-2">
                      Location
                      {sortBy === 'location' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('manufacturer')}
                  >
                    <div className="flex items-center gap-2">
                      Manufacturer
                      {sortBy === 'manufacturer' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortBy === 'status' && (
                        <span className="text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleHeaderClick('operatingHours')}
                  >
                    <div className="flex items-center gap-2">
                      Operating Hours
                      {sortBy === 'operatingHours' && (
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
                    <td colSpan={9} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-gray-600 font-medium">Loading equipment...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEquipmentList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <Settings className="w-12 h-12 text-gray-300" />
                        <span className="text-gray-500 font-medium">
                          {equipmentList.length === 0 ? 'No equipment found' : 'No equipment matches your filters'}
                        </span>
                        {(searchTerm || filterType || filterStatus || filterLocation || filterManufacturer) && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setFilterType('');
                              setFilterStatus('');
                              setFilterLocation('');
                              setFilterManufacturer('');
                            }}
                            className="mt-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-lg hover:border-indigo-400 transition-colors"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEquipmentList.map((eq, index) => (
                    <tr key={eq._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="p-4">
                        <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                          {eq.id || eq._id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(eq.type)}</span>
                          <span className="text-sm text-gray-700">{eq.type}</span>
                        </div>
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
                          <span className="text-sm text-gray-700">{eq.serialNo || eq.serialNumber}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{eq.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{eq.manufacturer}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(eq.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{eq.operatingHours || 0}h</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDetails(eq._id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300"
                            title="Open"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
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
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Equipment Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Equipment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      disabled={editIndex !== null} // Disable in edit mode
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Equipment Type</option>
                      {equipmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Serial Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="serialNo"
                      value={form.serialNo}
                      onChange={handleChange}
                      placeholder="Enter serial number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Enter equipment location"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Manufacturer <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="manufacturer"
                      value={form.manufacturer}
                      onChange={handleChange}
                      disabled={!form.type}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {form.type ? 'Select Manufacturer' : 'Select Equipment Type First'}
                      </option>
                      {getManufacturers(form.type).map(manufacturer => (
                        <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Model Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="modelType"
                      value={form.modelType}
                      onChange={handleChange}
                      disabled={!form.manufacturer}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {form.manufacturer ? 'Select Model Type' : 'Select Manufacturer First'}
                      </option>
                      {getModels(form.type, form.manufacturer).map((model: any) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  {/* Installation Date */}
                  <div>
                    <label htmlFor='installationDate' className="block text-sm font-semibold text-gray-700 mb-2">
                      Installation Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id='installationDate'
                      type="date"
                      name="installationDate"
                      value={form.installationDate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    />
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Operating Hours
                    </label>
                    <input
                      type="number"
                      name="operatingHours"
                      value={form.operatingHours}
                      onChange={handleChange}
                      min="0"
                      placeholder="Enter operating hours"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                    />
                  </div>
                </div>

                {/* Manual Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Manual Link
                  </label>
                  <input
                    type="url"
                    name="manualLink"
                    value={form.manualLink}
                    onChange={handleChange}
                    placeholder="https://example.com/manual.pdf"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gradient-to-r from-gray-50 to-white"
                  />
                </div>

                {/* Image Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image Link
                  </label>
                  <input
                    type="url"
                    name="imageLink"
                    value={form.imageLink}
                    onChange={handleChange}
                    placeholder="https://example.com/device-image.jpg"
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


