import express from 'express';
import auth from '../middleware/auth.js';

import {
   getFeedPosts,
   refreshFeedPosts,
   createPost,
   updatePost,
   deletePost,
   postUpVote,
   postDownVote,
   getProfilePosts,
   refreshProfilePosts,
   getExplorePosts,
   getTagPosts
} from '../controllers/post.js';

const router = express.Router();

router.get('/feedposts', auth, getFeedPosts);
router.get('/refreshfeed', auth, refreshFeedPosts);
router.get('/profileposts/:userId', auth, getProfilePosts);
router.get('/refreshprofileposts/:userId', auth, refreshProfilePosts);
router.get('/exploreposts', auth, getExplorePosts);
router.get('/tagposts/:tag', auth, getTagPosts);

router.post('/', auth, createPost);

router.patch('/:postId', auth, updatePost);
router.patch('/:postId/postUpVote', auth, postUpVote);
router.patch('/:postId/postDownVote', auth, postDownVote);

router.delete('/:postId', auth, deletePost);

export default router;