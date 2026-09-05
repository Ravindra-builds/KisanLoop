// Provider & Adapter Interfaces and Normalized Domain Models

export interface NormalizedWeather {
  temperatureC: number;
  humidityPercent: number;
  rainfallMm: number;
  rainProbabilityPercent: number;
  windSpeedKmh: number;
  condition: string;
  isRainExpected: boolean;
  forecastDate: Date;
  summary: string;
}

export interface WeatherProvider {
  getWeatherForecast(lat: number, lon: number): Promise<NormalizedWeather>;
}

export interface NormalizedSoil {
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  ph: number;
  organicCarbonPercent: number;
  moisturePercent: number;
  isMoistureSufficient: boolean;
}

export interface SoilProvider {
  getSoilData(lat: number, lon: number): Promise<NormalizedSoil>;
}

export interface NormalizedSatellite {
  ndvi: number; // 0.0 - 1.0 (Vegetation vigor)
  ndwi: number; // Moisture index
  evi: number;
  vegetationHealth: "EXCELLENT" | "GOOD" | "MODERATE" | "STRESSED";
  observationDate: Date;
  source: string;
}

export interface SatelliteProvider {
  getVegetationIndex(lat: number, lon: number): Promise<NormalizedSatellite>;
}

export interface VisionDiagnosisResult {
  pestOrDiseaseName: string;
  confidence: number;
  severity: "LOW" | "MODERATE" | "HIGH";
  symptoms: string[];
  requiresExpertReview: boolean;
  recommendedImmediateAction: string;
}

export interface VisionProvider {
  analyzeCropImage(imageBufferOrBase64: string, cropName: string): Promise<VisionDiagnosisResult>;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface SpeechToTextProvider {
  transcribe(audioBlobOrBase64: string): Promise<TranscriptionResult>;
}

export interface TextToSpeechResult {
  audioUrl?: string;
  audioBase64?: string;
  mimeType: string;
}

export interface TextToSpeechProvider {
  synthesize(text: string, language: string): Promise<TextToSpeechResult>;
}

export interface StorageProvider {
  uploadFile(fileBuffer: Buffer | Uint8Array, filename: string, mimeType: string): Promise<{ url: string; key: string; size: number }>;
  getFileUrl(key: string): Promise<string>;
}

export interface VectorSearchResult {
  id: string;
  documentId: string;
  score: number;
  text: string;
  metadata: Record<string, any>;
}

export interface VectorProvider {
  upsertVectors(collection: string, points: { id: string; vector: number[]; payload: Record<string, any> }[]): Promise<void>;
  searchVectors(collection: string, vector: number[], limit?: number): Promise<VectorSearchResult[]>;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}
