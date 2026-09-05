import { CacheProvider } from "./types";

export class MemoryCacheAdapter implements CacheProvider {
  private cache: Map<string, { value: any; expiresAt?: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

export class UpstashRedisAdapter implements CacheProvider {
  private url: string;
  private token: string;
  private fallback: MemoryCacheAdapter;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, "");
    this.token = token;
    this.fallback = new MemoryCacheAdapter();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const res = await fetch(`${this.url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Upstash returned ${res.status}`);
      const json = await res.json();
      if (!json.result) return null;
      try {
        return JSON.parse(json.result) as T;
      } catch {
        return json.result as T;
      }
    } catch (err) {
      console.warn("Upstash Redis get failed, using fallback:", err);
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const payload = typeof value === "string" ? value : JSON.stringify(value);
      const url = ttlSeconds
        ? `${this.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(payload)}?ex=${ttlSeconds}`
        : `${this.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(payload)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Upstash returned ${res.status}`);
    } catch (err) {
      console.warn("Upstash Redis set failed, using fallback:", err);
      await this.fallback.set(key, value, ttlSeconds);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await fetch(`${this.url}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
        cache: "no-store",
      });
    } catch (err) {
      console.warn("Upstash Redis del failed, using fallback:", err);
      await this.fallback.del(key);
    }
  }
}

const isExplicitDemo = process.env.DEMO_MODE === "true";
const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

export const cacheProvider: CacheProvider =
  !isExplicitDemo && redisUrl && redisToken
    ? new UpstashRedisAdapter(redisUrl, redisToken)
    : new MemoryCacheAdapter();
