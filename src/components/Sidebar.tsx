"use client";
import React, { useState } from 'react';
import { 
  Home, 
  Wrench, 
  ClipboardList, 
  Menu, 
  X,
  ChevronRight,
  Activity,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const HospiwiseSidebar = () => {
  const [open, setOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Home');
  const router = useRouter(); 
  const handleDrawerToggle = () => setOpen(!open);

  const handleNavigation = (path: string, itemName: string) => {
    setActiveItem(itemName);
    router.push(path);
    console.log(`Navigating to: ${path}`);
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/', 
      description: 'Overview & Analytics',
      color: 'text-blue-600'
    },
    { 
      name: 'Equipment', 
      icon: Wrench, 
      path: '/equipments', 
      description: 'Manage Equipment',
      color: 'text-indigo-600'
    },
    { 
      name: 'Maintenance', 
      icon: ClipboardList, 
      path: '/maintainance-logs', 
      description: 'Service Records',
      color: 'text-purple-600'
    },
    { 
      name: 'Analytics', 
      icon: Activity, 
      path: '/analytics', 
      description: 'Performance Metrics',
      color: 'text-green-600'
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/settings', 
      description: 'System Configuration',
      color: 'text-gray-600'
    }
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleDrawerToggle}
        className={`fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 ${
          open ? 'translate-x-60' : 'translate-x-0'
        }`}
      >
        {open ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-40 transition-all duration-300 ease-in-out ${
          open ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white text-center">Hospiwise</h1>
          <p className="text-slate-400 text-sm text-center mt-1">Equipment Management</p>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">John Martinez</p>
              <p className="text-slate-400 text-xs truncate">Maintenance Tech</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path, item.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-slate-700 group-hover:bg-slate-600'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-700">
          {/* Notifications */}
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mb-3 hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-slate-300 text-sm">Notifications</span>
            </div>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 p-3 bg-green-900 bg-opacity-50 rounded-lg border border-green-500 border-opacity-30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Main Content Spacer */}
      {open && (
        <div className="w-64 flex-shrink-0 hidden lg:block"></div>
      )}
    </>
  );
};

export default HospiwiseSidebar;