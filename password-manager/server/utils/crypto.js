const crypto = require('crypto');
const key = () => Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return { encryptedPassword: enc.toString('hex'), iv: iv.toString('hex'), authTag: c.getAuthTag().toString('hex') };
};

exports.decrypt = ({ encryptedPassword, iv, authTag }) => {
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'hex'));
  d.setAuthTag(Buffer.from(authTag, 'hex'));
  return Buffer.concat([d.update(Buffer.from(encryptedPassword, 'hex')), d.final()]).toString('utf8');
};
