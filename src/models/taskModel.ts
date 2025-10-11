import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for a Task document
export interface ITask extends Document {
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
}

// Mongoose schema defining fields, defaults, validation, and timestamps
const TaskSchema: Schema<ITask> = new Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'], 
      trim: true 
    },
    description: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['pending', 'completed'], 
      default: 'pending' 
    }
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

// Create and export Task model
const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
