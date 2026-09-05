import { mockDb } from "../db/mock-storage";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface DatasetPreview {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ColumnMappingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validRowCount: number;
}

export class DatasetService {
  async inspectFile(fileBuffer: Buffer, filename: string): Promise<DatasetPreview> {
    const ext = filename.split(".").pop()?.toUpperCase();

    if (ext === "CSV") {
      const csvStr = fileBuffer.toString("utf-8");
      const parsed = Papa.parse(csvStr, { header: true, skipEmptyLines: true });
      const headers = (parsed.meta.fields || []).map((h) => h.trim());
      return {
        headers,
        rows: parsed.data.slice(0, 10) as Record<string, any>[],
        totalRows: parsed.data.length,
      };
    } else if (ext === "XLSX" || ext === "XLS") {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      const headers = (jsonData[0] || []).map((h: any) => String(h).trim());
      const rows = jsonData.slice(1, 11).map((r: any[]) => {
        const obj: Record<string, any> = {};
        headers.forEach((h: string, idx: number) => {
          obj[h] = r[idx];
        });
        return obj;
      });
      return {
        headers,
        rows,
        totalRows: jsonData.length - 1,
      };
    } else {
      // JSON
      const jsonStr = fileBuffer.toString("utf-8");
      const arr = JSON.parse(jsonStr);
      const headers = Object.keys(arr[0] || {});
      return {
        headers,
        rows: arr.slice(0, 10),
        totalRows: arr.length,
      };
    }
  }

  validateMapping(
    headers: string[],
    mapping: Record<string, string>, // { field_name: selected_header }
    sampleRows: Record<string, any>[]
  ): ColumnMappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required target columns
    const requiredTargets = ["name", "latitude", "longitude"];
    for (const req of requiredTargets) {
      if (!mapping[req]) {
        errors.push(`Required field '${req}' is not mapped to any column.`);
      }
    }

    // Optional target columns
    const optionalTargets = ["crop_name", "area_acres", "irrigation_type"];
    for (const opt of optionalTargets) {
      if (!mapping[opt]) {
        warnings.push(`Optional field '${opt}' is not mapped. Default values will be assigned.`);
      }
    }

    // Validate sample row values
    if (mapping["latitude"] && mapping["longitude"]) {
      sampleRows.forEach((r, idx) => {
        const lat = parseFloat(r[mapping["latitude"]]);
        const lon = parseFloat(r[mapping["longitude"]]);
        if (isNaN(lat) || lat < 6 || lat > 38) {
          warnings.push(`Row ${idx + 1}: Latitude '${r[mapping["latitude"]]}' appears outside India coordinates.`);
        }
        if (isNaN(lon) || lon < 68 || lon > 98) {
          warnings.push(`Row ${idx + 1}: Longitude '${r[mapping["longitude"]]}' appears outside India coordinates.`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRowCount: sampleRows.length,
    };
  }

  async importDataset(
    name: string,
    filename: string,
    rowCount: number,
    mapping: Record<string, string>
  ) {
    return mockDb.datasets.create({
      name,
      filename,
      fileType: filename.split(".").pop()?.toUpperCase() || "CSV",
      rowCount,
      columnMapping: mapping,
      status: "IMPORTED",
    });
  }
}

export const datasetService = new DatasetService();
