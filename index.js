const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv = require('dotenv');

//import Routes
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');

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
