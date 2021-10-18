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

router.patch('/:postId', auth, updatePost);
router.patch('/:postId/postUpVote', auth, postUpVote);
router.patch('/:postId/postDownVote', auth, postDownVote);

router.delete('/:postId', auth, deletePost);

export default router;