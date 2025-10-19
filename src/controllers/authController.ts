// This controller handles user authentication: Sign Up and Login functionality using JWT.

import { Request, Response } from 'express';
import Joi from 'joi';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import User, { IUser } from '../models/userModel';
import { ObjectId } from 'mongoose';

// Joi schema for signup validation
const signupSchema = Joi.object({
  email: Joi
  .string()
  .email({ tlds: { allow: ['com', 'net', 'org'] } })
  .required(),
  password: Joi
  .string()
  .min(8)
  .required()
});

// Retrieves environment variables
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");

const JWT_SECRET: Secret = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h';
const COOKIE_MAX_AGE_MS = Number(process.env.COOKIE_MAX_AGE_MS) || 3600000;

 // Generates a JWT and sets it as an HttpOnly cookie
const generateAndSetToken = (res: Response, userId: string) => {
  
  const options = { expiresIn: JWT_EXPIRES_IN } as SignOptions; // SignOptions defines the structure of options for the sign function.

  const token = jwt.sign(
    { userId },
    JWT_SECRET,
    options
  );

  // Set the token as an HttpOnly cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_MS,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

// Controller function for user signup
export const signupUser = async (req: Request, res: Response) => {
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

    // Generate and set JWT token as an HttpOnly cookie
    generateAndSetToken(res, (newUser._id as ObjectId).toString());

    // Send success response
    res.status(201).json({
      status: 'success',
      message: 'User registered and logged in successfully.',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
        }
      }
    });

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};