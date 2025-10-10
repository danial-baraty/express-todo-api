import express from 'express';
import Task from '../models/taskModel';
import mongoose from 'mongoose';

const router = express.Router();

// --- GET All Tasks ---
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('[DB ERROR] Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// --- POST Create a Task ---
router.post('/', async (req, res) => {
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

// --- PUT Update a Task ---
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Task ID format.' });
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(`[DB ERROR] Failed to update task with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// --- DELETE a Task ---
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Task ID format.' });
  }

  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error(`[DB ERROR] Failed to delete task with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
