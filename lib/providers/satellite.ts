import { NormalizedSatellite, SatelliteProvider } from "./types";

export class DemoSatelliteAdapter implements SatelliteProvider {
  async getVegetationIndex(lat: number, lon: number): Promise<NormalizedSatellite> {
    return {
      ndvi: 0.72,
      ndwi: 0.35,
      evi: 0.68,
      vegetationHealth: "GOOD",
      observationDate: new Date(Date.now() - 172800000),
      source: "Sentinel-2 Multi-Spectral (Demo Feed)",
    };
  }
}

export const satelliteProvider: SatelliteProvider = new DemoSatelliteAdapter();
