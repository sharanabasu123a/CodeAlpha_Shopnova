const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return { memory: false };
  }

  const primary = process.env.MONGO_URI;

  if (primary) {
    try {
      await mongoose.connect(primary, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[db] Connected to MongoDB: ${primary.split('@').pop().split('/')[0]}`);
      return { memory: false };
    } catch (err) {
      if (process.env.USE_MEMORY_DB !== 'false') {
        console.warn('[db] MONGO_URI connection failed, falling back to in-memory DB.');
      } else {
        throw err;
      }
    }
  }

  // In-memory fallback (also used when MONGO_URI is unset so `npm run dev`
  // works out of the box for demos / submission review).
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  console.log('[db] Connected to in-memory MongoDB (mongodb-memory-server).');
  return { memory: true };
};

module.exports = connectDB;