import { setStatus } from '../controllers/user.js';

let users = [];

const socketIO = io => {
   io.on('connect', socket => {

      socket.on('user-online', userId => {
         if (userId && !users.some(user => user.userId === userId)) {
            users.push({ userId, socketId: socket.id });
            // console.log(users)
         }
         setStatus(userId, true);
      })

      socket.on('send-message', (receiverId, senderId, message, chatId) => {
         const user = users.find(user => user.userId == receiverId);
         if (user) {
            socket.to(user.socketId).emit('receive-message', message, senderId, chatId);
         }
      })
   
      socket.on('disconnect', () => {
         setStatus(users.find(user => user.socketId === socket.id).userId, false);
         users = users.filter(user => user.socketId !== socket.id);
         // console.log(users)
      });

   })
}

export default socketIO;