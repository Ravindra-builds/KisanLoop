import { weatherProvider } from "../providers/weather";
import { soilProvider } from "../providers/soil";
import { satelliteProvider } from "../providers/satellite";
import { mockDb } from "../db/mock-storage";
import { db } from "../db";
import { farms, farmStates, crops } from "../db/schema";
import { eq } from "drizzle-orm";

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
    let farmLat = 23.3441;
    let farmLon = 85.3096;
    let cropName = "Paddy (IR-64)";
    let cropStage = "Vegetative";

    if (db) {
      try {
        const found = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
        if (found.length > 0) {
          farmLat = found[0].latitude;
          farmLon = found[0].longitude;
        } else {
          // Fallback to first farm in DB
          const anyFarm = await db.select().from(farms).limit(1);
          if (anyFarm.length > 0) {
            farmLat = anyFarm[0].latitude;
            farmLon = anyFarm[0].longitude;
          }
        }
      } catch (err) {
        console.warn("DB farm lookup fallback to mock:", err);
      }
    } else {
      const mockFarm = mockDb.farms.findById(farmId) || mockDb.farms.findMany()[0];
      if (mockFarm) {
        farmLat = mockFarm.latitude;
        farmLon = mockFarm.longitude;
      }
    }

    const weather = await weatherProvider.getWeatherForecast(farmLat, farmLon);
    const soil = await soilProvider.getSoilData(farmLat, farmLon);
    const satellite = await satelliteProvider.getVegetationIndex(farmLat, farmLon);

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
      cropName,
      cropStage,
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

    if (db) {
      try {
        await db
          .insert(farmStates)
          .values({
            id: `fst_${farmId}`,
            farmId,
            cropName,
            cropStage,
            soilMoisture,
            rainRisk,
            heatRisk: "low",
            pestRisk: "moderate",
            diseaseRisk,
            overallRisk,
            summary,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: farmStates.id,
            set: {
              soilMoisture,
              rainRisk,
              diseaseRisk,
              overallRisk,
              summary,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        console.warn("DB farmStates upsert fallback:", dbErr);
      }
    }

    mockDb.farmStates.update(farmId, state);
    return state;
  }
}

export const farmStateService = new FarmStateService();

