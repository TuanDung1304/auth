import express from 'express';
import verify from './verifyToken.js';
import User from '../models/User.js';
const router = express.Router();

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const { firstName, lastName, email } = user;
  res.send({ firstName, lastName, email });
});

export default router;
