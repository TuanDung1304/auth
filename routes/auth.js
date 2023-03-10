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
  const { firstName, lastName, email, password } = req.body;

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
    firstName,
    lastName,
    email,
    password: hashPassword,
  });
  try {
    await user.save();
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
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

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
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '2 days',
    }
  );

  tokenList[refreshToken] = user._id;

  const response = {
    token,
    refreshToken,
  };

  res.json({ success: true, user: userInfo, token });
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
    return res.status(400).send('M???t kh???u hi???n t???i kh??ng ????ng');
  if (newPassword !== confirmPassword)
    return res.status(400).send('M???t kh???u nh???p l???i kh??ng ????ng');

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

  res.send('?????i m???t kh???u th??nh c??ng');
});

router.get('/info', verify, async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });
  const { firstName, lastName, email } = user;
  return res.json({ success: true, data: { firstName, lastName, email } });
});

export default router;
