

let users = [];

const socketIO = io => {
   io.on('connect', socket => {

      socket.on('user-online', userId => {
         if (userId && !users.some(user => user.userId === userId)) {
            users.push({ userId, socketId: socket.id });
            // console.log(users)
         }
      })

      socket.on('send-message', (receiverId, senderId, message) => {
         const user = users.find(user => user.userId == receiverId);
         if (user) {
            socket.to(user.socketId).emit('receive-message', message, senderId);
         }
      })
   
      socket.on('disconnect', () => {
         users = users.filter(user => user.socketId !== socket.id);
         // console.log(users)
      });

   })
}

export default socketIO;