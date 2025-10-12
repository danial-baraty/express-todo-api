
// This controller handles user authentication: Sign Up and Login functionality using JWT.

import { Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

// Joi schema for signup validation
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Controller function for user signup
export const signupUser = async (req: Request, res: Response) => {
  // Wrapping the whole controller in try…catch ensures all unexpected runtime errors are properly handled.
// Examples: Joi validation might throw if req.body is undefined, or jwt.sign could fail if JWT_SECRET is missing.

  try {
    // Validate request body using Joi
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create a new user (password will be hashed by pre-save middleware)
    const newUser = new User({ email, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },                 // payload
      process.env.JWT_SECRET || 'secretkey',   // secret
      { expiresIn: '1h' }                      // token expiration
    );

    // Send success response with token
    res.status(201).json({
      message: 'You registered successfully.',
      token,
    });

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
