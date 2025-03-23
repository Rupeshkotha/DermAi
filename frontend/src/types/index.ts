export interface AIInsights {
  overview: string;
  symptoms: string[];
  treatment: string[];
  medical_care: string[];
  prevention: string[];
}

export interface DiseaseResponse {
  disease_name: string;
  confidence: number;
  ai_insights: AIInsights;
}

export interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export interface ResultsProps {
  results: DiseaseResponse;
  loading?: boolean;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  conditionId: string;
  imageUrl: string;
  date: Date;
  confidence: number;
  notes: string;
  symptoms: string[];
  improvement: 'better' | 'same' | 'worse';
  ai_insights: AIInsights;
}

export interface MonitoredCondition {
  id: string;
  userId: string;
  diseaseName: string;
  startDate: Date;
  status: 'active' | 'completed' | 'archived';
  initialImage: string;
  initialConfidence: number;
  lastCheckIn?: {
    date: Date;
    confidence: number;
    improvement: 'better' | 'same' | 'worse';
  };
  checkInFrequency: 'daily' | 'weekly';
  nextCheckInDue: Date;
  notes: string;
} 