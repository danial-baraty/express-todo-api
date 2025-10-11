import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task, { ITask } from '../models/taskModel';

// --- GET All Tasks ---
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks: ITask[] = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('[DB ERROR] Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// --- POST Create a Task ---
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const task = new Task({
      title,
      description,
      status: 'pending',
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('[DB ERROR] Failed to create task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// --- PUT Update a Task ---
// Handles updating a task by validating the provided ID, then applying the request data via findByIdAndUpdate().
// If the task exists, the updated document is returned; if not found, the result is null and a 404 response is sent.
// Any validation or database errors are caught and returned with a 500 response.
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid Task ID format.' });
    return;
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate<ITask>(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(`[DB ERROR] Failed to update task with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// --- DELETE a Task ---
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid Task ID format.' });
    return;
  }

  try {
    const deletedTask = await Task.findByIdAndDelete<ITask>(id);

    if (!deletedTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error(`[DB ERROR] Failed to delete task with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

