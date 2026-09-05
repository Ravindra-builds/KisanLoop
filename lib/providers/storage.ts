import fs from "fs";
import path from "path";
import { StorageProvider } from "./types";

export class LocalStorageAdapter implements StorageProvider {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<{ url: string; key: string; size: number }> {
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(this.uploadsDir, key);

    await fs.promises.writeFile(filePath, fileBuffer);
    const size = fileBuffer.length;

    return {
      url: `/uploads/${key}`,
      key,
      size,
    };
  }

  async getFileUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}

export const storageProvider: StorageProvider = new LocalStorageAdapter();
