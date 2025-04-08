import { Logger } from "@nestjs/common";
import { Redis } from "ioredis";

export class DistributeCache {
    private static instance: DistributeCache;
    private readonly logger: Logger = new Logger(DistributeCache.name);
    private redisCache: Redis;

    private constructor() {
        try {
            this.redisCache = new Redis({
                host: "127.0.0.1",
                password: "",
                db: 0,
            });
            this.logger.debug("Redis Connected >>>>> ")
        } catch (error) {
            this.logger.error("Redis connection error:", error.message);
            process.exit(1);
        }
    }

    static getInstance(): DistributeCache {
        if (!this.instance) {
            this.instance = new DistributeCache();
        }
        return this.instance;
    }

    async setTTLString(key: string, value: string | Buffer, ttl: number | string): Promise<boolean> {
        const isSuccess = await this.redisCache.setex(key, ttl, value);
        return isSuccess === "OK";
    }

    async getString(key: string): Promise<string | null> {
        return await this.redisCache.getex(key);
    }

    async deleteKey(key: string) {
        await this.redisCache.unlink(key)
    }

    async getTTL(key: string): Promise<number> {
        return await this.redisCache.ttl(key)
    }
}

