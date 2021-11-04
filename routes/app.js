import express from 'express';
import auth from '../middleware/auth.js';
import { getTags } from '../controllers/app.js';

const router = express.Router();

router.get('/tags', auth, getTags);

export default router;