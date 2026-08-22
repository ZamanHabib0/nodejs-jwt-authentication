const mongoose = require('mongoose');
const { mongo, env } = require('./var.js');

mongoose.Promise = Promise;

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

if (env === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  const uri = mongo.uri || process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ WARNING: MONGO_URI is not defined in environment variables.');
    return;
  }

  try {
    mongoose.connect(uri);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB initial connection error:', error.message);
  }
};