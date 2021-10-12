import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/user.js';
import postRoutes from './routes/post.js';

const app = express();
dotenv.config();

app.use(cors({
   origin: [
      'http://localhost:3000',
      'http://192.168.1.200:3000',
      'http://192.168.1.201:3000'
   ]
}));
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

app.use('/user', userRoutes);
app.use('/post', postRoutes);

app.get('/', (req, res) => {
   res.send('Travelog API')
})

const port = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      console.log('connected to DB');
   })
   .catch(err => {
      console.log('DB Connection Error!', err);
   })

app.listen(port, () => {
   console.log(`listening on port ${port}`);
})