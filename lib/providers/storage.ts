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

export class R2StorageAdapter implements StorageProvider {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucket: string;
  private endpoint?: string;
  private fallback: LocalStorageAdapter;

  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint?: string;
  }) {
    this.accountId = config.accountId;
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.bucket = config.bucket;
    this.endpoint =
      config.endpoint ||
      (this.accountId ? `https://${this.accountId}.r2.cloudflarestorage.com` : undefined);
    this.fallback = new LocalStorageAdapter();
  }

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<{ url: string; key: string; size: number }> {
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `kisanloop/${timestamp}-${sanitizedName}`;

    if (this.endpoint && this.bucket) {
      try {
        const uploadUrl = `${this.endpoint}/${this.bucket}/${key}`;
        const res = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": mimeType,
          },
          body: fileBuffer as any,
        });
        if (res.ok) {
          return {
            url: uploadUrl,
            key,
            size: fileBuffer.length,
          };
        }
      } catch (err) {
        console.warn("R2 storage upload direct attempt failed, saving to local fallback:", err);
      }
    }

    return this.fallback.uploadFile(fileBuffer, filename, mimeType);
  }

  async getFileUrl(key: string): Promise<string> {
    if (this.endpoint && this.bucket && key.startsWith("kisanloop/")) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return this.fallback.getFileUrl(key);
  }
}

const isExplicitDemo = process.env.DEMO_MODE === "true";
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
const r2Bucket = process.env.R2_BUCKET;

export const storageProvider: StorageProvider =
  !isExplicitDemo && (r2Bucket || r2AccountId)
    ? new R2StorageAdapter({
        accountId: r2AccountId || "",
        accessKeyId: r2AccessKey || "",
        secretAccessKey: r2Secret || "",
        bucket: r2Bucket || "",
        endpoint: process.env.R2_ENDPOINT,
      })
    : new LocalStorageAdapter();
