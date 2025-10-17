import Redis from 'ioredis';

/**
 * Implements the Singleton pattern for the Redis client to ensure
 * a single connection is used across the entire application.
 */
class RedisClient {
    private static instance: Redis | null = null;

    private constructor() {} // Prevents external instantiation

    /**
     * Establishes a connection to Redis and performs a health check (PING).
     * Must be called during application startup (e.g., in server.ts).
     */
    public static async connect(): Promise<Redis> {
        if (RedisClient.instance) {
            return RedisClient.instance;
        }

        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = Number(process.env.REDIS_PORT) || 6379;

        const client = new Redis({
            host: redisHost,
            port: redisPort,
            connectTimeout: 10000, // Timeout for connection attempt
        });
        
        // Log runtime connection errors
        client.on('error', (err) => {
            console.error(`[RUNTIME] Redis connection error:`, err.message);
        });

        // Test connection with PING to ensure Redis is available
        try {
            await client.ping();
            RedisClient.instance = client;
            console.log(`[INFO] Connected to Redis server at ${redisHost}:${redisPort}`);
            return client;

        } catch (error) {
            console.error(`[ERROR] Failed to establish initial connection to Redis.`);
            throw error;
        }
    }

    /**
     * Returns the established Singleton Redis instance.
     */
    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            // This error prevents using the client if connect() was not called first
            throw new Error('Redis not connected. Call RedisClient.connect() during startup first.');
        }
        return RedisClient.instance;
    }
}

export default RedisClient;