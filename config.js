require('dotenv').config();

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set — add it to your .env file');

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};