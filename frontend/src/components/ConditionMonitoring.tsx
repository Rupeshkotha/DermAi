import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MonitoringService from '../utils/monitoringService';
import { checkConnection } from '../utils/firestore';
import { MonitoredCondition, ProgressEntry, DiseaseResponse } from '../types';
import { analyzeProgress } from '../utils/aiService';
import ImageUpload from './ImageUpload';

// Create a singleton instance of MonitoringService
const monitoringService = MonitoringService.getInstance();

interface ConditionMonitoringProps {
  condition: MonitoredCondition;
  onStartMonitoring: (conditionId: string) => void;
}

const ConditionMonitoring: React.FC<ConditionMonitoringProps> = ({ condition, onStartMonitoring }) => {
  const { user } = useAuth();
  const [activeConditions, setActiveConditions] = useState<MonitoredCondition[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<MonitoredCondition | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [improvement, setImprovement] = useState<'better' | 'same' | 'worse'>('same');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      const connected = await checkConnection();
      setIsConnected(connected);
      if (connected && user) {
        loadActiveConditions();
      }
    };

    initializeConnection();
  }, [user]);

  useEffect(() => {
    if (selectedCondition && isConnected) {
      loadProgress(selectedCondition.id);
    }
  }, [selectedCondition, isConnected]);

  const loadActiveConditions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const conditions = await monitoringService.getUserActiveConditions(user.uid);
      setActiveConditions(conditions);
      if (condition && !selectedCondition) {
        setSelectedCondition(condition);
      }
    } catch (error) {
      console.error('Error loading conditions:', error);
      setError('Failed to load your monitored conditions. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async (conditionId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const entries = await monitoringService.getConditionProgress(conditionId);
      setProgress(entries);
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Failed to load progress entries. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (file: File) => {
    if (!user || !selectedCondition) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // First, upload the image and get the URL
      // TODO: Implement proper image upload
      const imageUrl = 'temp_url';
      
      // Send the image to the AI model for analysis
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const newAnalysis: DiseaseResponse = await response.json();
      
      // Get the previous scan for comparison
      const previousEntries = await monitoringService.getConditionProgress(selectedCondition.id);
      const previousScan = previousEntries.length > 0 ? previousEntries[0] : null;
      
      // Analyze progress if we have a previous scan
      let progressAnalysis = null;
      if (previousScan) {
        progressAnalysis = analyzeProgress(newAnalysis, {
          disease_name: selectedCondition.diseaseName,
          confidence: previousScan.confidence,
          ai_insights: previousScan.ai_insights || newAnalysis.ai_insights
        });
      }
      
      // Add the progress entry with the new analysis results
      await monitoringService.addProgressEntry(
        user.uid,
        selectedCondition.id,
        imageUrl,
        newAnalysis.confidence,
        notes,
        symptoms,
        progressAnalysis ? progressAnalysis.improvement : 'same',
        newAnalysis.ai_insights
      );

      setShowCheckIn(false);
      setNotes('');
      setSymptoms([]);
      setImprovement('same');
      loadProgress(selectedCondition.id);
      
    } catch (error) {
      console.error('Error adding check-in:', error);
      setError('Failed to submit your check-in. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImprovementColor = (improvement: 'better' | 'same' | 'worse') => {
    switch (improvement) {
      case 'better':
        return 'text-green-600 dark:text-green-400';
      case 'worse':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please sign in to access condition monitoring.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isConnected && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">Unable to connect to the database. Please check your internet connection.</p>
        </div>
      )}

      {/* Active Conditions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Monitored Conditions
        </h2>
        <div className="space-y-4">
          {activeConditions.map((cond) => (
            <div
              key={cond.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedCondition?.id === cond.id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedCondition(cond)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {cond.diseaseName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Started {new Date(cond.startDate).toLocaleDateString()}
                  </p>
                </div>
                {cond.lastCheckIn && (
                  <span className={`text-sm ${getImprovementColor(cond.lastCheckIn.improvement)}`}>
                    {cond.lastCheckIn.improvement === 'better' ? '↑' : 
                     cond.lastCheckIn.improvement === 'worse' ? '↓' : '→'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Tracking */}
      {selectedCondition && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Progress Tracking
            </h2>
            <button
              onClick={() => setShowCheckIn(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Check-in
            </button>
          </div>

          {/* Check-in Form */}
          {showCheckIn && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">New Check-in</h3>
              <div className="space-y-4">
                <ImageUpload onUpload={handleCheckIn} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    How is it compared to last time?
                  </label>
                  <div className="flex space-x-4">
                    {(['better', 'same', 'worse'] as const).map((value) => (
                      <button
                        key={value}
                        onClick={() => setImprovement(value)}
                        className={`px-4 py-2 rounded-lg ${
                          improvement === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                    rows={3}
                    placeholder="Add any notes about changes or observations..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="space-y-4">
            {progress.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className={`text-sm font-medium ${getImprovementColor(entry.improvement)}`}>
                      {entry.improvement.charAt(0).toUpperCase() + entry.improvement.slice(1)}
                    </p>
                  </div>
                  <img
                    src={entry.imageUrl}
                    alt="Progress"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
                {entry.notes && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ConditionMonitoring; 