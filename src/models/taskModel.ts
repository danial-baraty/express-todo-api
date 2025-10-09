import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Task extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
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
}, {
  timestamps: true // Ensures createdAt and updatedAt fields are automatically managed
});

export default mongoose.model<Task>('Task', TaskSchema);