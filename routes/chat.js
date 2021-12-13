import express from 'express';
import auth from '../middleware/auth.js';
import { sendMessage, getChats, newChat } from '../controllers/chat.js';

const router = express.Router();

router.get('/', auth, getChats)
router.post('/sendmessage/t/:userId', auth, sendMessage);
router.post('/new/t/:userId', auth, newChat);

export default router;