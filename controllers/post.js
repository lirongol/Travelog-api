import Post from '../models/post.js';
import User from '../models/user.js';
import { uploadPostMedia } from '../cloudinary/cloudinary.js';

export const getPosts = async (req, res) => {
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const postMessages = await Post.find();
      res.status(200).json(postMessages);
   } catch (error) {
      res.status(404).json({ message: error.message });
   }
}

export const createPost = async (req, res) => {
   const post = req.body;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const newPost = new Post(post);
      newPost.creator = user.username;
      newPost.creatorId = user._id;
      newPost.creatorProfileImg = user.profileImg.url;
      if (post.selectedFiles) {
         newPost.media = await uploadPostMedia(post.selectedFiles);
         newPost.selectedFiles = '';
      }
      await newPost.save();
      res.status(201).json(newPost);
   } catch (error) {
      res.status(409).json({ message: error.message });
   }
}

export const updatePost = async (req, res) => {
   const { id } = req.params;
   const post = req.body;
   try {
      const user = await User.findById(req.userId);
      if (!user || req.userId !== post.creatorId) return res.status(401).json({ message: 'Unauthorized' });
      if (!post.selectedFiles) {
         const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
         res.status(200).json(updatedPost);
      } else {
         post.media = await uploadPostMedia(post.selectedFiles);
         post.selectedFiles = '';
         const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
         res.status(200).json(updatedPost);
      }
   } catch (error) {
      res.status(409).json({ message: error.message });
   }
}

export const deletePost = async (req, res) => {
   const { id } = req.params;
   try {
      const user = await User.findById(req.userId);
      const post = await Post.findById(id);
      if (!user || req.userId !== post.creatorId) return res.status(401).json({ message: 'Unauthorized' });
      await Post.findByIdAndDelete(id);
      res.status(202).json({ message: 'Post deleted successfully' });
   } catch (error) {
      res.status(409).json({ message: error.message });
   }
}

export const postUpVote = async (req, res) => {
   const { id } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const post = await Post.findById(id);
      const index = post.upVotes.indexOf(req.userId);
      const downVoteIndex = post.downVotes.indexOf(req.userId);
      if (index === -1) {
         post.upVotes.push(req.userId);
         if (downVoteIndex !== -1) {
            post.downVotes.splice(downVoteIndex, 1);
         }
      } else {
         post.upVotes.splice(index, 1);
      }
      const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
      res.status(200).json(updatedPost);
   } catch (error) {
      res.status(409).json({ message: error.message });
   }
}

export const postDownVote = async (req, res) => {
   const { id } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const post = await Post.findById(id);
      const index = post.downVotes.indexOf(req.userId);
      const upVoteIndex = post.upVotes.indexOf(req.userId);
      if (index === -1) {
         post.downVotes.push(req.userId);
         if (upVoteIndex !== -1) {
            post.upVotes.splice(upVoteIndex, 1);
         }
      } else {
         post.downVotes.splice(index, 1);
      }
      const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
      res.status(200).json(updatedPost);
   } catch (error) {
      res.status(409).json({ message: error.message });
   }
}