"use client";
import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { Send, Wrench, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, User, Zap } from "lucide-react";
import { api } from "@/api/api";

// Define TypeScript types for equipment data
interface MaintenanceLog {
  date: string;
  description: string;
  status: string;
  technician: string;
  cost: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  duration: string;
  partsUsed: string;
  nextAction: string;
}

interface PredictiveStats {
  [key: string]: string;
}

interface Equipment {
  _id: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  imageUrl: string;
  maintenanceLogs: MaintenanceLog[];
  predictiveStats: PredictiveStats;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

const PredictiveStatsComponent: React.FC<{ stats: PredictiveStats }> = ({ stats }) => {
  const getStatIcon = (key: string) => {
    if (key.includes('Failure')) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    if (key.includes('Maintenance')) return <Calendar className="w-5 h-5 text-blue-500" />;
    if (key.includes('Usage')) return <Clock className="w-5 h-5 text-purple-500" />;
    if (key.includes('Health')) return <TrendingUp className="w-5 h-5 text-green-500" />;
    return <Zap className="w-5 h-5 text-indigo-500" />;
  };

  const getHealthColor = (value: string) => {
    const numValue = parseInt(value);
    if (numValue >= 80) return 'text-green-600 bg-green-50';
    if (numValue >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-800">Predictive Analytics</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              {getStatIcon(key)}
              <div>
                <p className="text-sm font-medium text-gray-600">{key}</p>
                <p className={`text-lg font-bold ${key.includes('Health') ? getHealthColor(value) : 'text-gray-800'} ${key.includes('Health') ? 'px-2 py-1 rounded-md' : ''}`}>
                  {value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EquipmentDetailsPage: React.FC = () => {
  // Enhanced dummy equipment data
  const equipment: Equipment = {
    _id: "eq12345",
    name: "Industrial Air Compressor",
    model: "Atlas Copco GA315",
    serialNumber: "AC-2024-7845",
    location: "Production Floor B - Station 3",
    imageUrl: "https://images.unsplash.com/photo-1581093588401-cb7c9e7588a6?auto=format&fit=crop&w=800&q=80",
    maintenanceLogs: [
      { 
        date: "2025-02-15", 
        description: "Replaced air filter and checked pressure sensors", 
        status: "Completed",
        technician: "John Martinez",
        cost: 245.50,
        priority: "Medium",
        duration: "2.5 hours",
        partsUsed: "Air filter (AF-315), Sensor kit",
        nextAction: "Monitor pressure readings"
      },
      { 
        date: "2024-12-01", 
        description: "Full system lubrication and belt inspection", 
        status: "Completed",
        technician: "Sarah Chen",
        cost: 125.00,
        priority: "Low",
        duration: "1.5 hours",
        partsUsed: "Lubricant (5L), Drive belt",
        nextAction: "Schedule next lubrication"
      },
      { 
        date: "2024-09-20", 
        description: "Emergency pressure valve replacement", 
        status: "Completed",
        technician: "Mike Rodriguez",
        cost: 780.25,
        priority: "Critical",
        duration: "4 hours",
        partsUsed: "Pressure valve, Gasket set",
        nextAction: "Conduct stress test"
      },
      { 
        date: "2024-07-10", 
        description: "Routine quarterly inspection", 
        status: "Completed",
        technician: "Emily Watson",
        cost: 95.00,
        priority: "Low",
        duration: "1 hour",
        partsUsed: "None",
        nextAction: "Update maintenance schedule"
      }
    ],
    predictiveStats: {
      "Failure Probability": "12%",
      "Next Maintenance Due": "2025-06-30",
      "Average Usage Hours": "760",
      "Health Score": "89%",
      "Efficiency Rating": "94%",
      "Temperature Status": "Normal"
    },
  };

  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);
    setChatLoading(true);

    const dataT = { prompt: chatInput }

  try {
      const res = await api.post("/query-ai", dataT) as any;

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      const botResponse = data.response;

      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Error fetching AI response." }]);
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">{equipment.name}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div><span className="font-medium">Model:</span> {equipment.model}</div>
            <div><span className="font-medium">Serial:</span> {equipment.serialNumber}</div>
            <div><span className="font-medium">Location:</span> {equipment.location}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Equipment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <h3 className="text-lg font-semibold">Equipment Overview</h3>
                <p className="text-indigo-100">Industrial-grade air compressor for high-volume applications</p>
              </div>
            </div>

            {/* Predictive Stats */}
            <PredictiveStatsComponent stats={equipment.predictiveStats} />

            {/* Maintenance Logs */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">Maintenance History</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Description</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Technician</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Priority</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Cost</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Duration</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.maintenanceLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-sm">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="p-3 text-sm max-w-xs">
                          <div className="font-medium text-gray-800">{log.description}</div>
                          <div className="text-xs text-gray-500 mt-1">Parts: {log.partsUsed}</div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {log.technician}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(log.priority)}`}>
                            {log.priority}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            ${log.cost.toFixed(2)}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {log.duration}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(log.status)}`}>
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Section: Troubleshooting Chat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">AI Assistant</h3>
              </div>
              
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-4 h-96 overflow-y-auto mb-4 border border-gray-200">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <Send className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Ask any troubleshooting questions about this equipment.</p>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-3`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <textarea
                  className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Ask about maintenance, troubleshooting, or operations..."
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={chatLoading}
                  rows={2}
                />
                <button
                  type="button"
                  title="Send Message"
                  onClick={handleChatSubmit}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailsPage;