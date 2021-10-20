import Post from '../models/post.js';
import User from '../models/user.js';
import { uploadPostMedia, uploadPostVideo } from '../cloudinary/cloudinary.js';


// get requests

export const getFeedPosts = async (req, res) => {
   const page = parseInt(req.query.page);
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const posts = await Post.find({
         creatorId: { $in: [req.userId, ...user.following] }
      }).sort({ createdAt: -1 }).skip(page * limit).limit(limit);

      const info = {
         prePage: page,
         nextPage: page + 1,
         noMorePosts: posts.length < limit
      };

      res.status(200).json({ posts, info });
   } catch (err) {
      console.log(err);
      res.status(404).json({ message: err.message });
   }
}

export const refreshFeedPosts = async (req, res) => {
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const posts = await Post.find({
         creatorId: { $in: [req.userId, ...user.following] }
      }).sort({ createdAt: -1 }).limit(limit);
      
      res.status(200).json({ posts });
   } catch (err) {
      console.log(err);
      res.status(404).json({ message: err.message });
   }
}

export const getProfilePosts = async (req, res) => {
   const { userId } = req.params;
   const page = parseInt(req.query.page);
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const posts = await Post.find({
         creatorId: { $in: userId }
      }).sort({ createdAt: -1 }).skip(page * limit).limit(limit);

      const info = {
         prePage: page,
         nextPage: page + 1,
         noMorePosts: posts.length < limit
      };

      res.status(200).json({ posts, info });
   } catch (err) {
      console.log(err);
      res.status(404).json({ message: err.message });
   }
}

export const refreshProfilePosts = async (req, res) => {
   const { userId } = req.params;
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const posts = await Post.find({
         creatorId: { $in: userId }
      }).sort({ createdAt: -1 }).limit(limit);
      
      res.status(200).json({ posts });
   } catch (err) {
      console.log(err);
      res.status(404).json({ message: err.message });
   }
}

// post requests

export const createPost = async (req, res) => {
   const post = req.body;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      if (post.selectedFiles.length !== 0 && post.selectedVideo.length !== 0 ||
         post.selectedFiles.length !== 0 && (post?.video ? post.video.length !== 0 : false) ||
         post.media.length !== 0 && post.selectedVideo.length !== 0 ||
         post.media.length !== 0 && (post?.video ? post.video.length !== 0 : false)
      ) { return res.status(403).json({ msg: 'attaching images and videos to the same post is not allowed' }) };
      const newPost = new Post(post);
      newPost.creator = user.username;
      newPost.creatorId = user._id;
      newPost.creatorProfileImg = user.profileImg.url;
      if (post.selectedFiles) {
         newPost.media = await uploadPostMedia(post.selectedFiles);
         newPost.selectedFiles = '';
      }
      if (post.selectedVideo) {
         newPost.video = [await uploadPostVideo(post.selectedVideo)];
         newPost.selectedVideo = '';
      }
      await newPost.save();
      res.status(201).json(newPost);
   } catch (err) {
      console.log(err);
      res.status(409).json({ message: err.message });
   }
}

// patch requests

export const updatePost = async (req, res) => {
   const { postId } = req.params;
   const post = req.body;
   try {
      const user = await User.findById(req.userId);
      if (!user || req.userId !== post.creatorId) return res.status(401).json({ message: 'Unauthorized' });
      if (!post.selectedFiles && !post.selectedVideo) {
         const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { ...post, isEdited: true },
            { new: true });
         res.status(200).json(updatedPost);
      } else {
         if (post.selectedFiles.length !== 0 && post.selectedVideo.length !== 0 ||
            post.selectedFiles.length !== 0 && (post?.video ? post.video.length !== 0 : false) ||
            post.media.length !== 0 && post.selectedVideo.length !== 0 ||
            post.media.length !== 0 && (post?.video ? post.video.length !== 0 : false)
         ) { return res.status(403).json({ msg: 'attaching images and videos to the same post is not allowed' }) };
         if (post.selectedFiles) {
            post.media = [...post.media, ...await uploadPostMedia(post.selectedFiles)];
            post.selectedFiles = '';
         }
         if (post.selectedVideo) {
            post.video = [await uploadPostVideo(post.selectedVideo)];
            post.selectedVideo = '';
         }
         const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { ...post, isEdited: true },
            { new: true });
         res.status(200).json(updatedPost);
      }
   } catch (err) {
      console.log(err);
      res.status(409).json({ message: err.message });
   }
}

export const postUpVote = async (req, res) => {
   const { postId } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const post = await Post.findById(postId);
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
      const updatedPost = await Post.findByIdAndUpdate(postId, post, { new: true });
      res.status(200).json(updatedPost);
   } catch (err) {
      console.log(err);
      res.status(409).json({ message: err.message });
   }
}

export const postDownVote = async (req, res) => {
   const { postId } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const post = await Post.findById(postId);
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
      const updatedPost = await Post.findByIdAndUpdate(postId, post, { new: true });
      res.status(200).json(updatedPost);
   } catch (err) {
      console.log(err);
      res.status(409).json({ message: err.message });
   }
}

// delete requests

export const deletePost = async (req, res) => {
   const { postId } = req.params;
   try {
      const user = await User.findById(req.userId);
      const post = await Post.findById(postId);
      if (!user || req.userId !== post.creatorId) return res.status(401).json({ message: 'Unauthorized' });
      await Post.findByIdAndDelete(postId);
      res.status(202).json({ message: 'Post deleted successfully' });
   } catch (err) {
      console.log(err);
      res.status(409).json({ message: err.message });
   }
}