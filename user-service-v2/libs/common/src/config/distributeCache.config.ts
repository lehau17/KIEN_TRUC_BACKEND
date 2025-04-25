import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

export class DistributeCache {
    private static instance: DistributeCache;
    private readonly logger: Logger = new Logger(DistributeCache.name);
    private redisCache: Redis;

    private constructor(private readonly configService: ConfigService) {
        try {
            this.redisCache = new Redis({
                host: this.configService.get<string>("REDIS_HOST") || "redis",
                port: this.configService.get<number>("REDIS_PORT") || 6379,
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
            this.instance = new DistributeCache(new ConfigService());
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

