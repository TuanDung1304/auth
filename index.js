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
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//Route middlewares
app.get('/', (req, res) => {
  res.send('Bài tập lớn mobile, Welcome :D');
});
app.use('/api/user', authRoute);
app.use('/api/posts', postsRoute);

app.listen(3001, () =>
  console.log('Server up an running: http://localhost:3001')
);
