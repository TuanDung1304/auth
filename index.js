import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const app = express();

//import Routes
import authRoute from './routes/auth.js';
import postsRoute from './routes/posts.js';

dotenv.config();

//connect to db
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to DB!'));

//Middleware
app.use(express.json());

//Route middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postsRoute);

app.listen(3000, () =>
  console.log('Server up an runnig: http://localhost:3000')
);
