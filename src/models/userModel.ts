import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface for User documents
export interface IUser extends Document {
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // hidden by default
  },
  { timestamps: true }
);

/**
 * Pre-save middleware to hash the password before saving the document.
 * Uses a regular function (not arrow func) to correctly bind `this` to the document.
 */
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only for user creation or password update

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    if (err instanceof Error) {
      next(new Error(`Error hashing password: ${err.message}`));
    } else {
      next(new Error('Unknown error while hashing password'));
    }
  }
});

/**
 * Compares the given password with the hashed password in the database.
 * Note: Mongoose does not provide a built-in method to compare plain passwords with hashed passwords for login,
 * so this custom method must be used whenever checking a user's password.
 */

UserSchema.methods.comparePassword = async function (
  candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
