import express from 'express';
import auth from '../middleware/auth.js';

import { login, register, getProfile, followProfile, updateBio, updateProfileImg } from '../controllers/user.js';

const router = express.Router();

router.get('/:username', auth, getProfile);

router.post('/login', login);
router.post('/register', register);

router.patch('/followprofile/:username', auth, followProfile);
router.patch('/updatebio', auth, updateBio);
router.patch('/updateprofileimg', auth, updateProfileImg);

export default router;