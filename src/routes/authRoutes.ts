
// Sign up user route
import express from 'express';
import { signupUser, loginUser } from '../controllers/authController';

const router = express.Router();

// Routes
router.post('/signup', signupUser);
router.post('/login', loginUser);

export default router;