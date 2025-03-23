import { DiseaseResponse } from '../types';

interface ProgressAnalysis {
  improvement: 'better' | 'same' | 'worse';
  confidenceChange: number;
  analysis: string;
}

interface TreatmentSuggestion {
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  description: string;
}

export const analyzeProgress = (currentScan: DiseaseResponse, previousScan: DiseaseResponse): ProgressAnalysis => {
  const confidenceChange = currentScan.confidence - previousScan.confidence;
  let improvement: 'better' | 'same' | 'worse' = 'same';
  
  if (Math.abs(confidenceChange) < 0.05) {
    improvement = 'same';
  } else {
    improvement = confidenceChange < 0 ? 'better' : 'worse';
  }

  return {
    improvement,
    confidenceChange,
    analysis: generateProgressAnalysis(improvement, confidenceChange, currentScan, previousScan)
  };
};

export const generateTreatmentPlan = (scan: DiseaseResponse): TreatmentSuggestion[] => {
  const suggestions: TreatmentSuggestion[] = [];
  
  // Convert treatment array into structured suggestions
  scan.ai_insights.treatment.forEach((treatment, index) => {
    const priority = index === 0 ? 'high' : index < 3 ? 'medium' : 'low';
    suggestions.push({
      recommendation: treatment,
      priority,
      timeframe: getTimeframeForPriority(priority),
      description: generateTreatmentDescription(treatment, scan.disease_name)
    });
  });

  return suggestions;
};

export const getSeverityLevel = (confidence: number): {
  level: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendations: string[];
} => {
  if (confidence < 0.4) {
    return {
      level: 'mild',
      description: 'Early stage or mild condition that can typically be managed with basic care',
      recommendations: [
        'Monitor the condition regularly',
        'Follow basic skin care routine',
        'Use over-the-counter treatments if recommended'
      ]
    };
  } else if (confidence < 0.7) {
    return {
      level: 'moderate',
      description: 'Moderate condition that requires consistent attention and care',
      recommendations: [
        'Schedule a follow-up with a dermatologist',
        'Follow prescribed treatment plan strictly',
        'Document any changes in symptoms'
      ]
    };
  } else {
    return {
      level: 'severe',
      description: 'Severe condition that requires immediate medical attention',
      recommendations: [
        'Seek immediate medical consultation',
        'Begin prescribed treatment as soon as possible',
        'Regular monitoring and documentation required'
      ]
    };
  }
};

// Helper functions
const generateProgressAnalysis = (
  improvement: 'better' | 'same' | 'worse',
  change: number,
  current: DiseaseResponse,
  previous: DiseaseResponse
): string => {
  const changePercent = Math.abs(change * 100).toFixed(1);
  
  switch (improvement) {
    case 'better':
      return `The condition has shown improvement with a ${changePercent}% decrease in detection confidence. Continue with the current treatment plan.`;
    case 'worse':
      return `The condition has shown some deterioration with a ${changePercent}% increase in detection confidence. Consider consulting your healthcare provider for treatment adjustment.`;
    default:
      return 'The condition appears stable with no significant changes. Continue monitoring and following the prescribed treatment plan.';
  }
};

const getTimeframeForPriority = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'Immediate action required';
    case 'medium':
      return 'Within 1-2 weeks';
    case 'low':
      return 'As part of ongoing maintenance';
  }
};

const generateTreatmentDescription = (treatment: string, diseaseName: string): string => {
  return `This treatment is specifically recommended for ${diseaseName}. ${treatment} Follow the prescribed duration and frequency for optimal results.`;
}; 