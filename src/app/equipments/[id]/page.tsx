"use client";
import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Send, Wrench, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, User, MapPin, Settings, ExternalLink } from "lucide-react";
// import Image from "next/image";
import { useParams } from "next/navigation";

// Updated TypeScript interfaces based on API response
interface MaintenanceHistory {
  _id: string;
  equipment: string;
  issue: string;
  description: string;
  resolution: string;
  technician: string;
  maintenanceDate: string;
  maintenanceId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Equipment {
  _id: string;
  id: string;
  type: string;
  name: string;
  serialNo: string;
  location: string;
  status: string;
  manualLink: string;
  imageLink: string;
  installationDate: string;
  manufacturer: string;
  modelType: string;
  operatingHours: number;
  createdAt: string;
  lastMaintenanceDate: string;
  maintenanceHistory: MaintenanceHistory[];
  __v: number;
}

interface PredictionData {
  equipment_id: string;
  prediction: {
    confidence: string;
    days_to_failure: number;
    failure_type: string;
    method: string;
    predicted_failure_date: string;
    risk_level: string;
  };
  recommendations: string[];
  timestamp: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

const EquipmentStatsComponent: React.FC<{ equipment: Equipment }> = ({ equipment }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'under maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'inactive': return 'text-red-600 bg-red-50 border-red-200';
      case 'out of service': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateUptime = () => {
    const installDate = new Date(equipment.installationDate);
    const now = new Date();
    const daysSinceInstall = Math.floor((now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceInstall > 0 ? Math.min(Math.floor((equipment.operatingHours / (daysSinceInstall * 24)) * 100), 100) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-800">Equipment Overview</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Current Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(equipment.status)}`}>
                {equipment.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Operating Hours</p>
              <p className="text-lg font-bold text-gray-800">{equipment.operatingHours.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Installation Date</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date(equipment.installationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Uptime</p>
              <p className="text-lg font-bold text-gray-800">{calculateUptime()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Last Maintenance</p>
              <p className="text-lg font-bold text-gray-800">
                {equipment.lastMaintenanceDate 
                  ? new Date(equipment.lastMaintenanceDate).toLocaleDateString()
                  : 'No maintenance recorded'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Maintenance</p>
              <p className="text-lg font-bold text-gray-800">{equipment.maintenanceHistory.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EquipmentDetailsPage: React.FC = () => {
  const params = useParams() 
  const equipmentId = params.id;
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [predictionLoading, setPredictionLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://hospiwise-backend.onrender.com/api/equipment/${equipmentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch equipment details: ${response.status}`);
      }
      
      const data = await response.json();
      setEquipment(data);
      handleIntialChatInput(data);
      // Call prediction API after getting equipment data
      fetchPredictionData(data);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError(err instanceof Error ? err.message : 'Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictionData = async (equipmentData: Equipment) => {
    try {
      setPredictionLoading(true);
      const response = await fetch('https://equipment-prediction-api.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prediction: ${response.status}`);
      }
      
      const data = await response.json();
      setPredictionData(data);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      // Don't show error for prediction, just skip it
    } finally {
      setPredictionLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetails();
  }, []);

  const getIssueTypeColor = (issue: string) => {
    switch (issue.toLowerCase()) {
      case 'software error': return 'bg-red-100 text-red-800 border-red-200';
      case 'hardware failure': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'calibration': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cleaning': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFailureTypeIcon = (failureType: string) => {
    switch (failureType.toLowerCase()) {
      case 'software error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'hardware failure': return <Wrench className="w-5 h-5 text-orange-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('✅') || recommendation.includes('Continue')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (recommendation.includes('💻') || recommendation.includes('Update') || recommendation.includes('firmware')) {
      return <Settings className="w-5 h-5 text-blue-500" />;
    } else if (recommendation.includes('⚠️') || recommendation.includes('Warning')) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <Wrench className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getRecommendationStyle = (recommendation: string) => {
    if (recommendation.includes('✅') || recommendation.includes('Continue')) {
      return 'border-l-4 border-green-500 bg-green-50';
    } else if (recommendation.includes('💻') || recommendation.includes('Update')) {
      return 'border-l-4 border-blue-500 bg-blue-50';
    } else if (recommendation.includes('⚠️') || recommendation.includes('Warning')) {
      return 'border-l-4 border-yellow-500 bg-yellow-50';
    } else {
      return 'border-l-4 border-indigo-500 bg-indigo-50';
    }
  };

    const handleIntialChatInput = async (eqData: any) => {
      setChatLoading(true);
      try {
        const res = await fetch("https://hospiwise-backend.onrender.com/api/ai/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ equipmentData: eqData })
        });
        
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        
        setChatSessionId(data.sessionId); // SAVE session ID
        setChatMessages([{ sender: "bot", text: data.response }]);
      } catch (error) {
        console.error("Chat error:", error);
        setChatMessages([{ sender: "bot", text: "Error fetching AI response." }]);
      } finally {
        setChatLoading(false);
      }
    };

    const handleChatSubmit = async () => {
      if (!chatInput.trim()) return;

      setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);
      setChatLoading(true);

      try {
        const res = await fetch("https://hospiwise-backend.onrender.com/api/ai/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: chatInput,
            sessionId: chatSessionId // INCLUDE session ID
          })
        });

        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        
        setChatMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Equipment</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchEquipmentDetails}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No equipment data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{equipment.name}</h1>
              <p className="text-lg text-gray-600">{equipment.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">ID:</span> 
              <span className="text-gray-600">{equipment.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Model:</span> 
              <span className="text-gray-600">{equipment.modelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Serial:</span> 
              <span className="text-gray-600">{equipment.serialNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Location:</span> 
              <span className="text-gray-600">{equipment.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Manufacturer:</span> 
              <span className="text-gray-600">{equipment.manufacturer}</span>
            </div>
            {equipment.manualLink && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                <a 
                  href={equipment.manualLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  User Manual
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Equipment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              {/* <Image
                width={800}
                height={400}
                src={equipment.imageLink || "https://images.unsplash.com/photo-1581093588401-cb7c9e7588a6"}
                alt={equipment.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1581093588401-cb7c9e7588a6";
                }}
              /> */}
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <h3 className="text-lg font-semibold">{equipment.type} Overview</h3>
                <p className="text-indigo-100">{equipment.modelType} by {equipment.manufacturer}</p>
              </div>
            </div>

            {/* Equipment Stats */}
            <EquipmentStatsComponent equipment={equipment} />

            {/* AI Prediction Section */}
            {predictionLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <h3 className="text-xl font-bold text-gray-800">Loading AI Prediction...</h3>
                </div>
              </div>
            ) : predictionData ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-800">AI Failure Prediction</h3>
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(predictionData.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Confidence Level</p>
                        <p className="text-xl font-bold text-purple-700">{predictionData.prediction.confidence}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Days to Potential Failure</p>
                        <p className="text-xl font-bold text-gray-800">{predictionData.prediction.days_to_failure} days</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      {getFailureTypeIcon(predictionData.prediction.failure_type)}
                      <div>
                        <p className="text-sm font-medium text-gray-600">Predicted Failure Type</p>
                        <p className="text-lg font-bold text-gray-800">{predictionData.prediction.failure_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Risk Level</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(predictionData.prediction.risk_level)}`}>
                          {predictionData.prediction.risk_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Predicted Failure Date</p>
                        <p className="text-lg font-bold text-gray-800">
                          {new Date(predictionData.prediction.predicted_failure_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Prediction Method</p>
                        <p className="text-sm font-bold text-indigo-700">{predictionData.prediction.method}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* AI Recommendations */}
            {predictionData && predictionData.recommendations && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-800">AI Recommendations</h3>
                </div>
                
                {predictionData.recommendations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No recommendations available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {predictionData.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md ${getRecommendationStyle(recommendation)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getRecommendationIcon(recommendation)}
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium leading-relaxed">
                              {recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Maintenance History */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">Maintenance History</h3>
              </div>
              
              {equipment.maintenanceHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No maintenance history recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Issue Type</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Description</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Resolution</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Technician</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Maintenance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.maintenanceHistory.map((record) => (
                        <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-sm">
                            {new Date(record.maintenanceDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getIssueTypeColor(record.issue)}`}>
                              {record.issue}
                            </span>
                          </td>
                          <td className="p-3 text-sm max-w-xs">
                            <div className="font-medium text-gray-800">{record.description}</div>
                          </td>
                          <td className="p-3 text-sm max-w-xs">
                            <div className="text-gray-600">{record.resolution}</div>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {record.technician}
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {record.maintenanceId}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                      {/* <p className="text-sm">{msg.text}</p> */}
                      <pre className="overflow-x-auto whitespace-pre-wrap">{msg.text}</pre>

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