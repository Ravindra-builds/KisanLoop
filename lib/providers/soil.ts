import { NormalizedSoil, SoilProvider } from "./types";

export class DemoSoilAdapter implements SoilProvider {
  async getSoilData(lat: number, lon: number): Promise<NormalizedSoil> {
    return {
      nitrogenKgHa: 125,
      phosphorusKgHa: 42,
      potassiumKgHa: 58,
      ph: 6.4,
      organicCarbonPercent: 0.62,
      moisturePercent: 68.5,
      isMoistureSufficient: true,
    };
  }
}

export const soilProvider: SoilProvider = new DemoSoilAdapter();
