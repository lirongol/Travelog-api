import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user.js';
import Post from '../models/post.js';
import * as error from '../helpers/errorMsg.js';
import { uploadProfileImg } from '../cloudinary/cloudinary.js';
import { parseName, parseUsername, checkSpacialChar, checkPhoneNumber } from '../helpers/index.js';


export const login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const existingUser = await User.findOne({ email: String(email) });
      if (!existingUser) return res.status(404).json({ msg: error.incorrect });
      const isCorrectPassword = await bcrypt.compare(String(password), existingUser.password);
      if (!isCorrectPassword) return res.status(400).json({ msg: error.incorrect });
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET);
      existingUser.email = null;
      existingUser.password = null;
      existingUser.phoneNumber = null;
      res.status(200).json({ existingUser, token });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const register = async (req, res) => {
   const { firstName, lastName, username, email, phoneNumber, password, passwordVerification } = req.body;
   try {
      if (firstName.length > 20 || lastName.length > 20) return res.status(400).json({ msg: error.charLength });
      if (checkSpacialChar(firstName) || checkSpacialChar(lastName)) return res.status(400).json({ msg: error.spacialCharName });
      if (username.length > 20) return res.status(400).json({ msg: error.usernameLength });
      if (checkSpacialChar(username)) return res.status(400).json({ msg: error.spacialCharusername });
      if (checkPhoneNumber(phoneNumber) || phoneNumber.length > 20) return res.status(400).json({ msg: error.phoneNumber });
      if (password !== passwordVerification) return res.status(400).json({ msg: error.passwordVerify });
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) return res.status(400).json({ msg: error.emailExists });
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) return res.status(400).json({ msg: error.usernameExsits });
      const hashedPassword = await bcrypt.hash(password, 12);
      const existingUser = await User.create({
         firstName: parseName(firstName),
         lastName: parseName(lastName),
         username: parseUsername(username),
         email,
         phoneNumber,
         password: hashedPassword,
         profileImg: { url: 'https://res.cloudinary.com/travelog/image/upload/v1626965253/profile_img/profile_wnyc41.jpg' },
      });
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET);
      existingUser.email = null;
      existingUser.password = null;
      existingUser.phoneNumber = null;
      res.status(200).json({ existingUser , token });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getProfile = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      const userProfile = await User.findOne({ username }).select(['-password', '-email', '-phoneNumber']);
      if (!userProfile) return res.status(404).json({ msg: error.userNotFound });
      res.status(200).json(userProfile);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const followProfile = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      if (existingUser.username === username) return res.status(401).json({ msg: error.unauthorized });
      const followedUser = await User.findOne({ username: String(username) });
      if (!followedUser) return res.status(404).json({ msg: 'User does not exists' });
      const loggedInUserIndex = followedUser.followers.indexOf(existingUser._id);
      const folloedUserIndex = existingUser.following.indexOf(followedUser._id);
      if (loggedInUserIndex === -1 || folloedUserIndex === -1) {
         if (loggedInUserIndex === -1) followedUser.followers.push(existingUser._id);
         if (folloedUserIndex === -1) existingUser.following.push(followedUser._id);
      } else {
         if (loggedInUserIndex !== -1) followedUser.followers.splice(loggedInUserIndex, 1);
         if (folloedUserIndex !== -1) existingUser.following.splice(folloedUserIndex, 1);
      }
      await User.findByIdAndUpdate(existingUser._id, existingUser, { new: true });
      const updatedFollowedUser = await User.findByIdAndUpdate(
         followedUser._id, followedUser,
         { new: true }).select(['-password', '-email', '-phoneNumber']);
      res.status(200).json(updatedFollowedUser);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const updateBio = async (req, res) => {
   const { bio } = req.body;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      existingUser.bio = bio;
      const updatedProfile = await User.findByIdAndUpdate(
         req.userId, existingUser,
         { new: true }).select(['-password', '-email', '-phoneNumber']);
      res.status(200).json(updatedProfile);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const updateProfileImg = async (req, res) => {
   const { img } = req.body;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      const profileImg = await uploadProfileImg(img);
      if (profileImg.err) {
         return res.status(profileImg.err.http_code).json({ msg: profileImg.err.message });
      }
      existingUser.profileImg = profileImg;
      const updatedProfile = await User.findByIdAndUpdate(
         req.userId, existingUser,
         { new: true }).select(['-password', '-email', '-phoneNumber']);
      res.status(200).json(updatedProfile);
      await Post.updateMany({ creatorId: req.userId }, { $set: { creatorProfileImg: profileImg.url } });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getProfileFollowers = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      const profile = await User.findOne({ username });
      if (!profile) return res.status(404).json({ msg: error.userNotFound });
      const followers = await User.find({ _id: { $in: profile.followers } })
         .select(['profileImg', 'username', '-_id']);
      res.status(200).json(followers);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getProfileFollowing = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      const profile = await User.findOne({ username });
      if (!profile) return res.status(404).json({ msg: error.userNotFound });
      const following = await User.find({ _id: { $in: profile.following } })
         .select(['profileImg', 'username', '-_id']);
      res.status(200).json(following);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getProfileImages = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      const profile = await User.findOne({ username });
      if (!profile) return res.status(404).json({ msg: error.userNotFound });
      const media = await Post.find({ creatorId: profile._id })
         .sort({ createdAt: -1 })
         .select(['media', '-_id']);
      const images = [];
      for (let i of media) {
         for (let img of i.media) {
            images.push(img);
         }
      }
      res.status(200).json(images);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getProfileVideos = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ msg: error.unauthorized });
      const profile = await User.findOne({ username });
      if (!profile) return res.status(404).json({ msg: error.userNotFound });
      const postVideos = await Post.find({ creatorId: profile._id })
         .sort({ createdAt: -1 })
         .select(['-_id', 'video']);
      const videos = [];
      for (let i of postVideos) {
         if (i.video[0]) {
            videos.push(i.video[0]);
         }
      }
      res.status(200).json(videos);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}