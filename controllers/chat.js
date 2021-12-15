import Chat from '../models/chat.js';
import User from '../models/user.js';
import * as error from '../helpers/errorMsg.js';


export const getChats = async (req, res) => {
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

      const chats = await Chat.find({ 'users.id': user._id });

      res.status(200).json(chats);
   } catch (err) {
      res.status(500).json({ msg: error.server });
      console.log(err.message)
   }
}

export const sendMessage = async (req, res) => {
   const receiverId = req.params.userId;
   const { message } = req.body;
   try {
      const sender = await User.findById(req.userId);
      if (!sender) return res.status(401).json({ msg: error.unauthorized });
      const receiver = await User.findById(receiverId);
      if (!receiver) return res.status(404).json({ msg: 'user not found' });

      const existingChat = await Chat.findOne({
         $and: [
            { 'users.id': sender._id },
            { 'users.id': receiver._id }
         ]
      });

      existingChat.messages.push({
         userId: sender._id,
         text: message,
         confirmed: true
      });

      await existingChat.save();
      const newMessage = existingChat.messages.at(-1);
      res.status(200).json({ newMessage, chatId: existingChat._id });
      
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}

export const newChat = async (req, res) => {
   const receiverId = req.params.userId;
   try {
      const sender = await User.findById(req.userId);
      if (!sender) return res.status(401).json({ msg: error.unauthorized });
      const receiver = await User.findById(receiverId);
      if (!receiver) return res.status(404).json({ msg: 'user not found' });

      const existingChat = await Chat.findOne({
         $and: [
            { 'users.id': sender._id },
            { 'users.id': receiver._id }
         ]
      });

      if (!existingChat) {
         const newChat = new Chat({
            users: [
               {
                  id: sender._id,
                  profileImg: sender.profileImg,
                  fullName: sender.fullName,
                  username: sender.username
               },
               {
                  id: receiver._id,
                  profileImg: receiver.profileImg,
                  fullName: receiver.fullName,
                  username: receiver.username
               }
            ]
         });
   
         const chat = await newChat.save();
         res.status(200).json(chat);
      }

   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}