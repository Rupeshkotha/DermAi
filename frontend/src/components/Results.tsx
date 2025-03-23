import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ResultsProps } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="w-full max-w-3xl animate-pulse space-y-8">
    {/* Detection Results Card Skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
      <div className="flex space-x-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
      </div>
    </div>

    {/* AI Analysis Card Skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
      
      {/* Overview Section */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
      </div>

      {/* Symptoms Section */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
      </div>

      {/* Treatment Section */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5"></div>
      </div>
    </div>
  </div>
);

const Results: React.FC<ResultsProps> = ({ results }) => {
  if (!results) return null;

  // Check if confidence is low or if the disease name suggests normal skin
  const isLowConfidence = results.confidence < 0.35; // Increased threshold to 40%
  const isNormalSkin = results.disease_name.toLowerCase().includes('normal') || 
                      results.disease_name.toLowerCase().includes('healthy') ||
                      results.disease_name.toLowerCase().includes('clear') ||
                      results.disease_name.toLowerCase().includes('unaffected');

  if (isLowConfidence || isNormalSkin) {
    return (
      <div className="space-y-6">
        {/* Low Confidence Detection Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analysis Results</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
              No Skin Condition Detected
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Your skin appears to be healthy and normal. No concerning conditions were detected in the scanned area.
            </p>
          </div>
        </div>

        {/* General Skin Health Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Skin Health Tips</h2>
          </div>
          <div className="p-6 space-y-6">
            <Section title="Daily Care">
              <ul className="list-disc pl-5 space-y-2">
                <li>Keep your skin clean and moisturized</li>
                <li>Use sunscreen with SPF 30 or higher</li>
                <li>Stay hydrated by drinking plenty of water</li>
                <li>Maintain a healthy diet rich in vitamins and antioxidants</li>
              </ul>
            </Section>

            <Section title="Prevention">
              <ul className="list-disc pl-5 space-y-2">
                <li>Protect your skin from excessive sun exposure</li>
                <li>Avoid smoking and limit alcohol consumption</li>
                <li>Get regular exercise to improve circulation</li>
                <li>Manage stress levels as it can affect skin health</li>
              </ul>
            </Section>

            <Section title="Regular Check-ups">
              <ul className="list-disc pl-5 space-y-2">
                <li>Monitor your skin for any changes</li>
                <li>Schedule regular skin check-ups with a dermatologist</li>
                <li>Keep track of any new moles or spots</li>
                <li>Report any concerning changes to your healthcare provider</li>
              </ul>
            </Section>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This analysis is for informational purposes only and should not be considered medical advice. 
            Always consult with a qualified healthcare professional for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    );
  }

  // Original results display for detected conditions
  return (
    <div className="space-y-6">
      {/* Detection Results Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detection Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Detected Disease</h3>
            <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
              {results.disease_name}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Confidence Score</h3>
            <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-100">
              {(results.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis</h2>
        </div>
        <div className="p-6 space-y-6">
          <Section title="Overview">
            <p>{results.ai_insights.overview}</p>
          </Section>

          <Section title="Symptoms">
            <ul className="list-disc pl-5 space-y-2">
              {results.ai_insights.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </Section>

          <Section title="Treatment">
            <ul className="list-disc pl-5 space-y-2">
              {results.ai_insights.treatment.map((treatment, index) => (
                <li key={index}>{treatment}</li>
              ))}
            </ul>
          </Section>

          <Section title="Medical Care">
            <ul className="list-disc pl-5 space-y-2">
              {results.ai_insights.medical_care.map((care, index) => (
                <li key={index}>{care}</li>
              ))}
            </ul>
          </Section>

          <Section title="Prevention">
            <ul className="list-disc pl-5 space-y-2">
              {results.ai_insights.prevention.map((prevention, index) => (
                <li key={index}>{prevention}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          This analysis is for informational purposes only and should not be considered medical advice. 
          Always consult with a qualified healthcare professional for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};

export default Results; 