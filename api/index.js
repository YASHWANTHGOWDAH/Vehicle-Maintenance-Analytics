const app = require('../server/server');
const { connectDB } = require('../server/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Vercel Serverless] DB initialization note:', err.message);
  }
  return app(req, res);
};
