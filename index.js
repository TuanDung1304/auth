import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const app = express();

//import Routes
import authRoute from './routes/auth.js';
import userInfoRoute from './routes/userInfo.js';

dotenv.config();

//connect to db
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to DB!'));

//Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

//Route middlewares
app.get('/', (req, res) => {
  res.send('Bài tập lớn mobile, Welcome :D');
});
app.use('/api/user', authRoute);
app.use('/api/user-information', userInfoRoute);

app.listen(3001, () =>
  console.log('Server up an running: http://localhost:3001')
);
