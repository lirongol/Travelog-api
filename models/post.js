import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
   creator: { type: String, required: true },
   creatorId: { type: String, required: true },
   creatorProfileImg: String,
   location: String,
   postText: String,
   tags: [String],
   selectedFiles: [String],
   selectedVideo: [String],
   media: [{ url: String, filename: String }],
   video: [{ url: String, filename: String }],
   upVotes: { type: [String], default: [] },
   downVotes: { type: [String], default: [] }
}, {timestamps: true})

const Post = mongoose.model('Post', postSchema);

export default Post;