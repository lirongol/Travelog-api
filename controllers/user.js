import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user.js';

export const login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) return res.status(404).json({ message: 'Incorrect Email or Password.' });
      const isCorrectPassword = await bcrypt.compare(password, existingUser.password);
      if (!isCorrectPassword) return res.status(400).json({ message: 'Incorrect Email or Password.' });
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'test');
      res.status(200).json({ existingUser , token });
   } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' });
   }
}

export const register = async (req, res) => {
   const { firstName, lastName, username, email, phoneNumber, password, passwordVerification } = req.body;
   try {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) return res.status(400).json({ message: 'Email already exists!' });
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) return res.status(400).json({ message: 'Username is taken!' });
      if (password !== passwordVerification) return res.status(400).json({ message: 'Passwords don\'t match!' });
      const hashedPassword = await bcrypt.hash(password, 12);
      const existingUser = await User.create({
         firstName: firstName.trim().toLowerCase(),
         lastName: lastName.trim().toLowerCase(),
         username: username.trim().toLowerCase(),
         email,
         phoneNumber,
         password: hashedPassword,
         profileImg: { url: 'https://res.cloudinary.com/travelog/image/upload/v1626965253/profile_img/profile_wnyc41.jpg' },
      });
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'test');
      res.status(200).json({ existingUser , token });
   } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' });
   }
}

export const getUserInfo = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ message: 'Unauthorized' });
      const userInfo = await User.findOne({ username });
      if (!userInfo) return res.status(404).json({ message: 'User does not exists' });
      res.status(200).json(userInfo);
   } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' });
   }
}

export const followUser = async (req, res) => {
   const { username } = req.params;
   try {
      const existingUser = await User.findById(req.userId);
      if (!existingUser) return res.status(401).json({ message: 'Unauthorized' });
      const followedUser = await User.findOne({ username });
      if (!followedUser) return res.status(404).json({ message: 'User does not exists' });
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
      const updatedFollowedUser = await User.findByIdAndUpdate(followedUser._id, followedUser, { new: true });
      res.status(200).json(updatedFollowedUser);
   } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' });
   }
}