import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables immediately
dotenv.config();

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

// --- Middleware ---
// Enable CORS for frontend applications
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// --- Routes ---
// Test route to check server status
app.get('/', (req, res) => {
  res.send('Todo API is running...');
});

// --- Server Startup Function ---
/**
 * Connects to MongoDB Atlas and starts the Express server.
 * The server only starts if the database connection is successful.
 */
const startServer = async () => {
  if (!MONGO_URI) {
    // Critical safety check before attempting connection
    console.error('[ERROR] MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    // Await database connection before proceeding
    await mongoose.connect(MONGO_URI);
    console.log('[INFO] Connected to MongoDB Atlas');

    // Start listening for requests only after successful database connection
    app.listen(PORT, () => {
      console.log(`[INFO] Server running on port ${PORT}`);
    });
  } catch (err) {
    // Handle fatal connection errors gracefully
    console.error('[ERROR] Fatal Connection Error:', err);
    process.exit(1);
  }
};

// Execute the startup function
startServer();
