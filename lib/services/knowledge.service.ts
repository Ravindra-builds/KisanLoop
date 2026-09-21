import { mockDb } from "../db/mock-storage";
import { db } from "../db";
import { knowledgeDocuments } from "../db/schema";
import { vectorProvider, generateTextEmbedding } from "../providers/vector";
import { storageProvider } from "../providers/storage";
import mammoth from "mammoth";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export class KnowledgeService {
  async listDocuments() {
    if (db) {
      try {
        const rows = await db.select().from(knowledgeDocuments);
        if (rows.length > 0) return rows;
      } catch (err) {
        console.warn("DB knowledge documents query failed, falling back to mockDb:", err);
      }
    }
    return mockDb.knowledgeDocuments.findMany();
  }

  async processAndIndexDocument(fileBuffer: Buffer, filename: string, mimeType: string) {
    // 1. Upload to Cloudflare R2 / Storage Provider
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

    const docId = `kdoc_${Date.now()}`;
    const title = filename.replace(/\.[^/.]+$/, "");

    // 4. Save metadata to database (Neon DB + mock fallback)
    if (db) {
      try {
        await db.insert(knowledgeDocuments).values({
          id: docId,
          title,
          filename,
          fileType: ext,
          storageKey: uploadResult.key,
          fileSizeBytes: uploadResult.size,
          chunkCount: chunks.length,
          status: "READY",
        });
      } catch (dbErr) {
        console.warn("Failed to insert knowledge doc into PostgreSQL:", dbErr);
      }
    }

    const doc = mockDb.knowledgeDocuments.create({
      id: docId,
      title,
      filename,
      fileType: ext,
      storageKey: uploadResult.key,
      fileSizeBytes: uploadResult.size,
      chunkCount: chunks.length,
      status: "READY",
    });

    // 5. Generate embeddings and upsert to Qdrant Vector Store
    const vectorPoints = await Promise.all(
      chunks.map(async (chunk, idx) => ({
        id: `${doc.id}_chk_${idx}`,
        vector: await generateTextEmbedding(chunk, 128),
        payload: {
          documentId: doc.id,
          filename,
          text: chunk,
          chunkIndex: idx,
          storageUrl: uploadResult.url,
        },
      }))
    );

    await vectorProvider.upsertVectors("agricultural_knowledge", vectorPoints);

    return doc;
  }

  async searchKnowledge(query: string, limit: number = 3) {
    const queryVector = await generateTextEmbedding(query, 128);
    return vectorProvider.searchVectors("agricultural_knowledge", queryVector, limit);
  }
}

export const knowledgeService = new KnowledgeService();

