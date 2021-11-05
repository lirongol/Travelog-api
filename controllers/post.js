import Post from '../models/post.js';
import User from '../models/user.js';
import App from '../models/app.js';
import { uploadPostMedia, uploadPostVideo } from '../cloudinary/cloudinary.js';
import * as error from '../helpers/errorMsg.js';
import { getHashtags, calcScore } from '../helpers/index.js';


// get requests

export const getFeedPosts = async (req, res) => {
   const page = parseInt(req.query.page);
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

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
      res.status(500).json({ msg: error.server });
   }
}

export const refreshFeedPosts = async (req, res) => {
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

      const posts = await Post.find({
         creatorId: { $in: [req.userId, ...user.following] }
      }).sort({ createdAt: -1 }).limit(limit);
      
      res.status(200).json({ posts });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getProfilePosts = async (req, res) => {
   const { userId } = req.params;
   const page = parseInt(req.query.page);
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

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
      res.status(500).json({ msg: error.server });
   }
}

export const refreshProfilePosts = async (req, res) => {
   const { userId } = req.params;
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

      const posts = await Post.find({
         creatorId: { $in: userId }
      }).sort({ createdAt: -1 }).limit(limit);
      
      res.status(200).json({ posts });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getExplorePosts = async (req, res) => {
   const page = parseInt(req.query.page);
   const limit = parseInt(req.query.limit);
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

      const posts = await Post.find({ creatorId: {$ne: req.userId}})
         .sort({ score: -1, createdAt: -1 })
         .skip(page * limit)
         .limit(limit);

      const info = {
         prePage: page,
         nextPage: page + 1,
         noMorePosts: posts.length < limit
      };

      res.status(200).json({ posts, info });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const getTagPosts = async (req, res) => {
   const page = parseInt(req.query.page);
   const limit = parseInt(req.query.limit);
   const { tag } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

      const { tags } = await App.findOne().select(['tags', '-_id']);

      const posts = await Post.find({ _id: { $in: tags[tag] } })
         .sort({ score: -1, createdAt: -1 })
         .skip(page * limit)
         .limit(limit);

      const info = {
         prePage: page,
         nextPage: page + 1,
         noMorePosts: posts.length < limit
      };

      res.status(200).json({ posts, info });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

// post requests

export const createPost = async (req, res) => {
   const post = req.body;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });
      if (post.selectedFiles.length !== 0 && post.selectedVideo.length !== 0 ||
         post.selectedFiles.length !== 0 && (post?.video ? post.video.length !== 0 : false) ||
         post.media.length !== 0 && post.selectedVideo.length !== 0 ||
         post.media.length !== 0 && (post?.video ? post.video.length !== 0 : false)) {
         return res.status(403).json({ msg: 'attaching images and videos to the same post is not allowed' });
      };
      const newPost = new Post(post);
      newPost.creator = user.username;
      newPost.creatorId = user._id;
      newPost.creatorProfileImg = user.profileImg.url;
      newPost.tags = getHashtags(post.postText);
      if (post.selectedFiles) {
         const uploadedMedia = await uploadPostMedia(post.selectedFiles);
         if (uploadedMedia.err) {
            return res.status(uploadedMedia.err.http_code).json({ msg: uploadedMedia.err.message });
         }
         newPost.media = uploadedMedia;
         newPost.selectedFiles = '';
      }
      if (post.selectedVideo) {
         const uploadedVideo = await uploadPostVideo(post.selectedVideo);
         if (uploadedVideo.err) {
            return res.status(uploadedVideo.err.http_code).json({ msg: uploadedVideo.err.message });
         }
         newPost.video = uploadedVideo;
         newPost.selectedVideo = '';
      }
      await newPost.save();
      res.status(201).json(newPost);

      const app = await App.findOne();
      for (let tag of newPost.tags) {
         if (app.tags[tag] === undefined) {
            app.tags[tag] = [newPost._id.toString()];
         } else {
            app.tags[tag].push(newPost._id.toString());
         }
      }
      await App.findOneAndUpdate({}, app);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

// patch requests

export const updatePost = async (req, res) => {
   const { postId } = req.params;
   const post = req.body;
   try {
      const user = await User.findById(req.userId);
      const oldPost = await Post.findById(postId).select('tags');
      if (!user || req.userId !== post.creatorId) return res.status(401).json({ msg: error.unauthorized });
      if (!post.selectedFiles && !post.selectedVideo) {
         const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
               ...post,
               tags: getHashtags(post.postText),
               isEdited: true
            },
            { new: true });
         res.status(200).json(updatedPost);

         const app = await App.findOne();
         for (let tag of oldPost.tags) {
            const index = app.tags[tag].indexOf(oldPost._id.toString());
            if (index >= 0) {
               app.tags[tag].splice(index, 1);
            }
         }
         for (let tag of updatedPost.tags) {
            if (app.tags[tag] === undefined) {
               app.tags[tag] = [updatedPost._id.toString()];
            } else {
               app.tags[tag].push(updatedPost._id.toString());
            }
         }
         await App.findOneAndUpdate({}, app);
         
      } else {
         if (post.selectedFiles.length !== 0 && post.selectedVideo.length !== 0 ||
            post.selectedFiles.length !== 0 && (post?.video ? post.video.length !== 0 : false) ||
            post.media.length !== 0 && post.selectedVideo.length !== 0 ||
            post.media.length !== 0 && (post?.video ? post.video.length !== 0 : false)
         ) { return res.status(403).json({ msg: 'attaching images and videos to the same post is not allowed' }) };
         if (post.selectedFiles) {
            const uploadedMedia = await uploadPostMedia(post.selectedFiles);
            if (uploadedMedia.err) {
               return res.status(uploadedMedia.err.http_code).json({ msg: uploadedMedia.err.message });
            }
            post.media = [...post.media, ...uploadedMedia];
            post.selectedFiles = '';
         }
         if (post.selectedVideo) {
            const uploadedVideo = await uploadPostVideo(post.selectedVideo);
            if (uploadedVideo.err) {
               return res.status(uploadedVideo.err.http_code).json({ msg: uploadedVideo.err.message });
            }
            post.video = uploadedVideo;
            post.selectedVideo = '';
         }
         const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
               ...post,
               isEdited: true,
               tags: getHashtags(post.postText)
            },
            { new: true });
         res.status(200).json(updatedPost);

         const app = await App.findOne();
         for (let tag of oldPost.tags) {
            const index = app.tags[tag].indexOf(oldPost._id.toString());
            if (index >= 0) {
               app.tags[tag].splice(index, 1);
            }
         }
         for (let tag of updatedPost.tags) {
            if (app.tags[tag] === undefined) {
               app.tags[tag] = [updatedPost._id.toString()];
            } else {
               app.tags[tag].push(updatedPost._id.toString());
            }
         }
         await App.findOneAndUpdate({}, app);
      }

   } catch (err) {
      console.log(err);
      res.status(500).json({ msg: error.server });
   }
}

export const postUpVote = async (req, res) => {
   const { postId } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });
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
      post.score = calcScore(post.upVotes.length, post.downVotes.length, post.createdAt);
      const updatedPost = await Post.findByIdAndUpdate(postId, post, { new: true });
      res.status(200).json(updatedPost);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const postDownVote = async (req, res) => {
   const { postId } = req.params;
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });
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
      post.score = calcScore(post.upVotes.length, post.downVotes.length, post.createdAt);
      const updatedPost = await Post.findByIdAndUpdate(postId, post, { new: true });
      res.status(200).json(updatedPost);
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

// delete requests

export const deletePost = async (req, res) => {
   const { postId } = req.params;
   try {
      const user = await User.findById(req.userId);
      const post = await Post.findById(postId);
      if (!user || req.userId !== post.creatorId) return res.status(401).json({ msg: error.unauthorized });
      await Post.findByIdAndDelete(postId);
      res.status(202).json({ msg: 'Post deleted successfully' });

      const app = await App.findOne();
      for (let tag of post.tags) {
         const index = app.tags[tag].indexOf(post._id.toString());
         if (index >= 0) {
            app.tags[tag].splice(index, 1);
         }
      }
      await App.findOneAndUpdate({}, app);
      
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}