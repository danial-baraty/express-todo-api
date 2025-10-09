import mongoose, { Schema, Document, Types } from 'mongoose';

// Defines the structure and rules of a Task document, specifying field types, defaults, validation, and enabling automatic timestamps
const TaskSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    trim: true 
  },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'completed'],  // Defines the allowed values for the field
    default: 'pending' 
  }
}, {
  timestamps: true // Ensures createdAt and updatedAt fields are automatically managed
});

// Task interface defines the shape and types of a task document for TypeScript, 
// allowing TypeScript to check field types when working with task documents, 
// for example when using .find() or .create() methods.

// Even though _id, createdAt, and updatedAt are not explicitly listed in the schema, Mongoose automatically adds them to each document when saving. 
// _id is always generated as a unique identifier by MongoDB. 
// createdAt and updatedAt are added and managed automatically when timestamps are enabled in the schema. 
// In the schema, we only define fields that are not automatically added by Mongoose.
export interface Task extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Creates and exports the Task model based on TaskSchema, enabling database operations 
// (e.g., find, create, update, delete) through Mongoose
export default mongoose.model<Task>('Task', TaskSchema);
