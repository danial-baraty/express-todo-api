import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; 
import RedisClient from './config/RedisClient';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

// --- Configuration Variables ---
const PORT: number = Number(process.env.PORT) || 3000;
const MONGO_URI: string | undefined = process.env.MONGO_URI;

const app: Application = express();

// --- Middleware Setup ---
app.use(cors());
app.use(helmet()); 
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));


// --- Routes ---
app.get('/', (req: Request, res: Response): void => {
    res.send('Todo API is running...');
});

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);


// --- Validate required environment variables ---
const validateEnv = (): void => {
    const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'PORT', 'COOKIE_MAX_AGE_MS', 'REDIS_HOST', 'REDIS_PORT'];
    const numericVars = ['PORT', 'COOKIE_MAX_AGE_MS', 'REDIS_PORT'];
    
    // Check for missing variables
    const missingVars = requiredVars.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
        console.error(`[ERROR] Missing environment variables: ${missingVars.join(', ')}`);
        process.exit(1); 
    }

    // Check for numeric integrity and positive values
    for (const key of numericVars) {
        const value = process.env[key];
        if (isNaN(Number(value)) || Number(value) <= 0) {
            console.error(`[ERROR] Environment variable ${key} must be a positive number, but found: ${value}`);
            process.exit(1);
        }
    }
};


// --- Server Startup ---
const startServer = async (): Promise<void> => {
    try {
        // Connect and check health of Redis client instance
        await RedisClient.connect(); 

        // Connect to MongoDB
        await mongoose.connect(MONGO_URI!);
        console.log('[INFO] Connected to MongoDB Atlas');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`[INFO] Server running on port ${PORT}`);
        });

    } catch (err: unknown) {
        // Handles failure in connecting to Redis or MongoDB
        if (err instanceof Error) {
            console.error('[FATAL] Startup Error:', err.message);
        } else {
            console.error('[FATAL] Unknown Startup Error:', err);
        }
        process.exit(1);
    }
};

validateEnv();
startServer();