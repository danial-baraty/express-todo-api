import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';


dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;
const MONGO_URI: string | undefined = process.env.MONGO_URI;

const app: Application = express();

// --- Middleware ---
app.use(cors());

// Limit incoming request body size to prevent DoS attacks with large payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));


// --- Base route ---
app.get('/', (req: Request, res: Response): void => {
  res.send('Todo API is running...');
});

// --- Task Routes ---
app.use('/api/tasks', taskRoutes);

// --- Auth Routes ---
app.use('/api/auth', authRoutes);

// --- Server Startup ---
const startServer = async (): Promise<void> => {
  if (!MONGO_URI) {
    console.error('[ERROR] MONGO_URI is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('[INFO] Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`[INFO] Server running on port ${PORT}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR] Connection Error:', err.message);
    } else {
      console.error('[ERROR] Connection Error:', err);
    }
    process.exit(1);
  }
};

// Start the server
startServer();
