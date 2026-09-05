import { weatherProvider } from "../providers/weather";
import { soilProvider } from "../providers/soil";
import { satelliteProvider } from "../providers/satellite";
import { mockDb } from "../db/mock-storage";

export interface FarmStateDTO {
  farmId: string;
  cropName: string;
  cropStage: string;
  soilMoisture: "dry" | "adequate" | "saturated";
  rainRisk: "low" | "moderate" | "high";
  heatRisk: "low" | "moderate" | "high";
  pestRisk: "low" | "moderate" | "high";
  diseaseRisk: "low" | "moderate" | "high";
  overallRisk: "low" | "medium" | "high";
  summary: string;
  weather: any;
  soil: any;
  satellite: any;
  updatedAt: Date;
}

export class FarmStateService {
  async getFarmState(farmId: string): Promise<FarmStateDTO> {
    const farm = mockDb.farms.findById(farmId);
    if (!farm) throw new Error("Farm not found");

    const weather = await weatherProvider.getWeatherForecast(farm.latitude, farm.longitude);
    const soil = await soilProvider.getSoilData(farm.latitude, farm.longitude);
    const satellite = await satelliteProvider.getVegetationIndex(farm.latitude, farm.longitude);

    // Evaluate risks
    const rainRisk = weather.isRainExpected && weather.rainProbabilityPercent > 70 ? "high" : "low";
    const soilMoisture = soil.moisturePercent > 65 ? "adequate" : soil.moisturePercent < 30 ? "dry" : "adequate";
    const diseaseRisk = weather.humidityPercent > 80 && weather.temperatureC > 25 ? "moderate" : "low";
    const overallRisk = rainRisk === "high" || diseaseRisk === "moderate" ? "medium" : "low";

    const summary = rainRisk === "high"
      ? `Heavy rain (${weather.rainfallMm}mm) forecast in next 24h. Soil moisture is already adequate (${soil.moisturePercent}%). Do not irrigate.`
      : `Crop condition is healthy. Weather is favorable for vegetative development.`;

    const state: FarmStateDTO = {
      farmId,
      cropName: "Paddy (IR-64)",
      cropStage: "Vegetative",
      soilMoisture,
      rainRisk,
      heatRisk: "low",
      pestRisk: "moderate",
      diseaseRisk,
      overallRisk,
      summary,
      weather,
      soil,
      satellite,
      updatedAt: new Date(),
    };

    mockDb.farmStates.update(farmId, state);
    return state;
  }
}

export const farmStateService = new FarmStateService();
