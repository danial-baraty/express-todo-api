import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// TypeScript interface for User
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Mongoose schema for User
const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // hide password by default
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

/*
  --- Mongoose Pre-Save Middleware ---

  This is a Mongoose pre-save middleware. It runs before the 'save' method is executed on a user document.

  In JavaScript, you can call another function inside your own function in these cases:
  1. If it's in scope (global, local variable, or via closure)
  2. If it's passed as an argument (callback pattern)
  3. If it's a method on an object or imported from a module
  Based on that, this async function needs 'next' as an argument, so it can call it.

  The password is only considered "changed" if:
  - a new user is being created, OR
  - an existing user updates their password.
  
  If the password hasn't changed, the middleware skips hashing and calls next() immediately.

  Reminder:
  - Do NOT use arrow functions in Mongoose middleware.
*/

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Method to compare given password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export User model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;