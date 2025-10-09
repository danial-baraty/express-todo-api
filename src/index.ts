import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Task from './models/taskModel'; 

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Todo API is running...');
});

// --- API Endpoints ---

// GET All Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('[DB ERROR] Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST Create a Task (Revised for _id usage)
app.post('/api/tasks', async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      status: 'pending'
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('[DB ERROR] Failed to create task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT/PATCH Update a Task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  // Basic validation for the ID format (optional but good practice)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Task ID format.' });
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // 'new: true' returns the updated doc; 'runValidators: true' ensures schema validators run
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(`[DB ERROR] Failed to update task with ID ${id}:`, error);
    // Check for validation errors from Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a Task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Task ID format.' });
  }
  
  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Standard response for successful deletion (204 No Content or 200 OK with message)
    res.status(200).json({ message: 'Task deleted successfully.' });
    // Alternative: res.sendStatus(204); 
    
  } catch (error) {
    console.error(`[DB ERROR] Failed to delete task with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

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