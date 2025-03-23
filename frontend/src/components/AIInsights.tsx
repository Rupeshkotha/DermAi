import React from 'react';
import { DiseaseResponse } from '../types';
import { analyzeProgress, generateTreatmentPlan, getSeverityLevel } from '../utils/aiService';
import { ChartBarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AIInsightsProps {
  currentScan: DiseaseResponse;
  previousScan?: DiseaseResponse;
}

const AIInsights: React.FC<AIInsightsProps> = ({ currentScan, previousScan }) => {
  const severityInfo = getSeverityLevel(currentScan.confidence);
  const treatmentPlan = generateTreatmentPlan(currentScan);
  const progress = previousScan ? analyzeProgress(currentScan, previousScan) : null;

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'mild':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'severe':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          AI Analysis Dashboard
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Severity Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Severity Assessment
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className={`w-5 h-5 ${getSeverityColor(severityInfo.level)}`} />
              <span className={`font-medium ${getSeverityColor(severityInfo.level)}`}>
                {severityInfo.level.charAt(0).toUpperCase() + severityInfo.level.slice(1)}
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{severityInfo.description}</p>
            <ul className="mt-3 space-y-2">
              {severityInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress Analysis */}
        {progress && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress Analysis
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className={`flex items-center space-x-2 ${
                progress.improvement === 'better' ? 'text-green-600 dark:text-green-400' :
                progress.improvement === 'worse' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                <ClockIcon className="w-5 h-5" />
                <span className="font-medium">
                  {progress.improvement.charAt(0).toUpperCase() + progress.improvement.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{progress.analysis}</p>
            </div>
          </div>
        )}

        {/* Treatment Plan */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Personalized Treatment Plan
          </h3>
          <div className="space-y-4">
            {treatmentPlan.map((treatment, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {treatment.recommendation}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    treatment.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                    treatment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {treatment.timeframe}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {treatment.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights; 