import express from 'express';
import auth from '../middleware/auth.js';
import { sendMessage, getChats } from '../controllers/chat.js';

const router = express.Router();

router.get('/', auth, getChats)
router.post('/sendmessage/t/:userId', auth, sendMessage);

export default router;