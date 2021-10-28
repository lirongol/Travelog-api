import express from 'express';
import auth from '../middleware/auth.js';

import {
   login,
   register,
   getProfile,
   followProfile,
   updateBio,
   updateProfileImg,
   getProfileFollowers,
   getProfileFollowing,
   getProfileImages,
   getProfileVideos
} from '../controllers/user.js';

const router = express.Router();

router.get('/:username', auth, getProfile);
router.get('/:username/followers', auth, getProfileFollowers);
router.get('/:username/following', auth, getProfileFollowing);
router.get('/:username/images', auth, getProfileImages);
router.get('/:username/videos', auth, getProfileVideos);

router.post('/login', login);
router.post('/register', register);

router.patch('/followprofile/:username', auth, followProfile);
router.patch('/updatebio', auth, updateBio);
router.patch('/updateprofileimg', auth, updateProfileImg);

export default router;