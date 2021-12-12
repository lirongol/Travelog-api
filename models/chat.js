import mongoose from 'mongoose';

const chatSchema = mongoose.Schema({
   users: [{
      id: String,
      profileImg: {},
      fullName: String,
      username: String
   }],
   messages: [{
      userId: String,
      text: String,
      confirmed: { type: Boolean, default: false },
      date: { type: Date, default: () => Date.now() }
   }],
}, {timestamps: true})

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;