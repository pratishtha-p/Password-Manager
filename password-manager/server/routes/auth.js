const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8)
    return res.status(400).json({ message: 'Enter an email and a password of at least 8 characters.' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'That email already has an account.' });
  const user = await User.create({ email, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: sign(user), email: user.email });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: sign(user), email: user.email });
});

module.exports = router;
