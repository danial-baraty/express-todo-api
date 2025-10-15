
// This controller handles user authentication: Sign Up and Login functionality using JWT.

import { Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/userModel';

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
    const existingUser: IUser | null = await User.findOne({ email });
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
      message: 'Registered successfully.',
      token,
    });

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// ---------------- Login Controller ----------------
// Handles user login: validates input, checks email/password, and returns JWT

// Joi schema for login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginUser = async (req: Request, res: Response) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // Find user and include password hash for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`[LOGIN DEBUG] No user found with email: ${email}`);
      return res.status(400).json({ message: 'Email or password is incorrect.' });
    }

    // Compare provided password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[LOGIN DEBUG] Password mismatch for email: ${email}`);
      return res.status(400).json({ message: 'Email or password is incorrect.' });
    }

    // Generate JWT token
    const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET!; 
    const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h';

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    // Set JWT in HttpOnly cookie
    const cookieMaxAgeMs = Number(process.env.COOKIE_MAX_AGE_MS);
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set the JWT in an HttpOnly cookie for security (mitigates XSS)
    res.cookie('jwt', token, {
      httpOnly: true, 
      secure: isProduction, // Use HTTPS in production
      maxAge: cookieMaxAgeMs,
      sameSite: 'strict', // Mitigates CSRF
    });

    // Respond with success message (token is in the cookie)
    res.status(200).json({
      message: 'Logged in successfully.',
      userId: user._id,
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};