const mongoose = require('mongoose');
module.exports = mongoose.model('Credential', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  site: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  encryptedPassword: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
}, { timestamps: true }));
