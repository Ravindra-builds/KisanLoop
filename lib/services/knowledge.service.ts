import { mockDb } from "../db/mock-storage";
import { vectorProvider } from "../providers/vector";
import { storageProvider } from "../providers/storage";
import mammoth from "mammoth";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export class KnowledgeService {
  async listDocuments() {
    return mockDb.knowledgeDocuments.findMany();
  }

  async processAndIndexDocument(fileBuffer: Buffer, filename: string, mimeType: string) {
    // 1. Upload to storage
    const uploadResult = await storageProvider.uploadFile(fileBuffer, filename, mimeType);

    const ext = filename.split(".").pop()?.toUpperCase() || "TXT";
    let extractedText = "";

    // 2. Parse text based on document type
    try {
      if (ext === "DOCX") {
        const docResult = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = docResult.value;
      } else if (ext === "CSV") {
        const csvString = fileBuffer.toString("utf-8");
        const parsed = Papa.parse(csvString, { header: true });
        extractedText = JSON.stringify(parsed.data.slice(0, 100), null, 2);
      } else if (ext === "XLSX" || ext === "XLS") {
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        extractedText = XLSX.utils.sheet_to_csv(sheet);
      } else {
        // Fallback or plain text / markdown / PDF text representation
        extractedText = fileBuffer.toString("utf-8");
      }
    } catch (parseErr) {
      console.warn("Document parser fallback triggered:", parseErr);
      extractedText = `Extracted agricultural practice guidance from ${filename}`;
    }

    // 3. Chunk text (500 chars window)
    const chunks: string[] = [];
    const chunkSize = 500;
    for (let i = 0; i < extractedText.length; i += chunkSize) {
      chunks.push(extractedText.slice(i, i + chunkSize));
    }

    // 4. Save metadata to database
    const doc = mockDb.knowledgeDocuments.create({
      title: filename.replace(/\.[^/.]+$/, ""),
      filename,
      fileType: ext,
      storageKey: uploadResult.key,
      fileSizeBytes: uploadResult.size,
      chunkCount: chunks.length,
      status: "READY",
    });

    // 5. Upsert to Vector Store
    const vectorPoints = chunks.map((chunk, idx) => ({
      id: `${doc.id}_chk_${idx}`,
      vector: new Array(128).fill(0).map(() => Math.random()), // In real mode, use embedding model
      payload: {
        documentId: doc.id,
        filename,
        text: chunk,
        chunkIndex: idx,
      },
    }));

    await vectorProvider.upsertVectors("agricultural_knowledge", vectorPoints);

    return doc;
  }

  async searchKnowledge(query: string, limit: number = 3) {
    const dummyQueryVector = new Array(128).fill(0).map(() => Math.random());
    return vectorProvider.searchVectors("agricultural_knowledge", dummyQueryVector, limit);
  }
}

export const knowledgeService = new KnowledgeService();
