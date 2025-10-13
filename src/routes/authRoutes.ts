
// Sign up user route
import express from 'express';
import { signupUser } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signupUser);

export default router;