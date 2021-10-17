import express from 'express';
import auth from '../middleware/auth.js';

import { login, register, getProfile, followUser } from '../controllers/user.js';

const router = express.Router();

router.get('/:username', auth, getProfile);

router.post('/login', login);
router.post('/register', register);

router.patch('/:username', auth, followUser);

export default router;