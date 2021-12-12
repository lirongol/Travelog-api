import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import socketIO from './socket/index.js';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/user.js';
import postRoutes from './routes/post.js';
import appRoutes from './routes/app.js';
import searchRoutes from './routes/search.js';
import chatRoutes from './routes/chat.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: { origin: ['http://localhost:3000', 'http://192.168.1.200:3000'] }
});
socketIO(io);

app.use(cors());
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/app', appRoutes);
app.use('/search', searchRoutes);
app.use('/chat', chatRoutes);

app.get('*', (req, res) => {
   res.send('Travelog API')
})

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      console.log('connected to DB');
   })
   .catch(err => {
      console.log('DB Connection Error!', err.message);
   })

const port = process.env.PORT || 5000;

server.listen(port, () => {
   console.log(`listening on port ${port}`);
})
