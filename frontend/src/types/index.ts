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