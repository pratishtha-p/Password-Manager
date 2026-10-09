const router = require('express').Router();
const auth = require('../middleware/auth');
const Credential = require('../models/Credential');
const { encrypt, decrypt } = require('../utils/crypto');

router.use(auth);

const out = (c) => ({ _id: c._id, site: c.site, username: c.username, password: decrypt(c), updatedAt: c.updatedAt });
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const valid = (b) => b.site && b.username && b.password;

router.get('/', async (req, res) => {
  const q = { user: req.userId };
  if (req.query.search) {
    const rx = new RegExp(esc(req.query.search), 'i');
    q.$or = [{ site: rx }, { username: rx }];
  }
  const items = await Credential.find(q).sort({ site: 1 });
  res.json(items.map(out));
});

router.post('/', async (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ message: 'Site, username and password are required.' });
  const { site, username, password } = req.body;
  res.status(201).json(out(await Credential.create({ user: req.userId, site, username, ...encrypt(password) })));
});

router.put('/:id', async (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ message: 'Site, username and password are required.' });
  const { site, username, password } = req.body;
  const c = await Credential.findOneAndUpdate({ _id: req.params.id, user: req.userId },
    { site, username, ...encrypt(password) }, { new: true });
  if (!c) return res.status(404).json({ message: 'Credential not found.' });
  res.json(out(c));
});

router.delete('/:id', async (req, res) => {
  const c = await Credential.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!c) return res.status(404).json({ message: 'Credential not found.' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
