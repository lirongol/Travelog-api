import express from 'express';
import auth from '../middleware/auth.js';
import { search } from '../controllers/search.js';

const router = express.Router();

router.get('/', auth, search);

export default router;