import express from 'express';
import auth from '../middleware/auth.js';

import {
   getFeedPosts,
   createPost,
   updatePost,
   deletePost,
   postUpVote,
   postDownVote
} from '../controllers/post.js';

const router = express.Router();

router.get('/feedposts', auth, getFeedPosts);

router.post('/', auth, createPost);

router.patch('/:id', auth, updatePost);
router.patch('/:id/postUpVote', auth, postUpVote);
router.patch('/:id/postDownVote', auth, postDownVote);

router.delete('/:id', auth, deletePost);

export default router;