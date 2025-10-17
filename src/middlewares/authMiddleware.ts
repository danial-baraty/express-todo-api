import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import RedisClient from '../config/RedisClient';

interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}

// Get the Singleton Redis instance
const redis = RedisClient.getInstance();

/**
 * Middleware to protect routes: verifies JWT, checks user existence, and uses Redis for caching.
 * Includes resilience logic to fall back to MongoDB if Redis fails.
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Verify JWT Token from cookie or header
        const token =
            req.cookies?.jwt ||
            req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, token missing.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const cacheKey = `user:${decoded.userId}`;

        let user;
        let cachedUser: string | null = null;

        // 2. Attempt to fetch user from Redis (FAST PATH)
        try {
            cachedUser = await redis.get(cacheKey);
        } catch (redisErr) {
            // FALLBACK: If Redis fails at runtime, log the warning and continue to DB lookup.
            console.warn('[REDIS FALLBACK] Redis failed. Proceeding to MongoDB.');
        }

        // 3. Handle cache hit or miss
        if (cachedUser) {
            // Cache hit: parse and use cached user
            user = JSON.parse(cachedUser);
        } else {
            // Cache miss OR Redis was down: fetch from MongoDB (SLOW PATH)
            user = await User.findById(decoded.userId).select('-password'); 

            if (!user) {
                return res.status(401).json({ message: 'User not found.' });
            }

            // 4. Attempt to recache in Redis (write-through) if the initial read didn't fail
            if (cachedUser !== undefined && cachedUser !== null) { 
                 try {
                     // Cache TTL is 1 hour
                     await redis.setex(cacheKey, 3600, JSON.stringify(user)); 
                 } catch (recacheErr) {
                     console.warn('[REDIS RECACHE FAILED] Could not write user data.');
                 }
            }
        }

        // 5. Attach user to request and proceed
        (req as any).user = user;
        next();

    } catch (err) {
        // Handles fatal errors: JWT expiration/invalid signature or final DB lookup failure
        console.error('Auth middleware FATAL error:', err);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};