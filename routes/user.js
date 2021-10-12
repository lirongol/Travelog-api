import express from 'express';
import auth from '../middleware/auth.js';

import { login, register, getUserInfo, followUser } from '../controllers/user.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/:username', auth, getUserInfo);
router.patch('/:username', auth, followUser);

export default router;