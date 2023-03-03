import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import verify from './verifyToken.js';
import {
  changePassValidation,
  loginValidation,
  registerValidation,
} from '../validation.js';
const router = express.Router();
const tokenList = {};

// Register---------------------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Lets validate
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if user is already in the db
  const emailExist = await User.findOne({ email });
  if (emailExist) return res.status(400).send('Email already exists');

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const user = new User({
    name,
    email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login---------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Lets validate
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the email exists
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Email is not found');

  // Password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: 600,
  });

  // refresh token
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET
  );

  tokenList[refreshToken] = user._id;

  const response = {
    token,
    refreshToken,
  };

  res.header('auth-token', token).send(token);
});

// Change password---------------------------
router.put('/change-password', verify, async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;
  //valitation
  const { error } = changePassValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // find User
  const user = await User.findOne({ _id: req.user._id });
  const { name, email, password: currentPassword } = user;

  // check password
  const validPassword = await bcrypt.compare(password, currentPassword);
  if (!validPassword)
    return res.status(400).send('Mật khẩu hiện tại không đúng');
  if (newPassword !== confirmPassword)
    return res.status(400).send('Mật khẩu nhập lại không đúng');

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = {
    name,
    email,
    password: hashPassword,
  };

  await User.findOneAndUpdate({ _id: req.user._id }, updatedUser, {
    returnOriginal: false,
  });

  res.send('Đổi mật khẩu thành công');
});

export default router;
