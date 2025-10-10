import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(express.json());

// --- Base route ---
app.get('/', (req, res) => {
  res.send('Todo API is running...');
});

// --- Use Task Routes ---
app.use('/api/tasks', taskRoutes); 

// --- Server Startup ---
const startServer = async () => {
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
  } catch (err) {
    console.error('[ERROR] Connection Error:', err);
    process.exit(1);
  }
};

startServer();
