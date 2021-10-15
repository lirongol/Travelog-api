import express from 'express';
import auth from '../middleware/auth.js';

import { getPosts, createPost, updatePost, deletePost, postUpVote, postDownVote } from '../controllers/post.js';

const router = express.Router();

router.get('/', auth, getPosts);
router.post('/', auth, createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/postUpVote', auth, postUpVote);
router.patch('/:id/postDownVote', auth, postDownVote);

export default router;