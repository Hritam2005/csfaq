import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/test_local')
  .then(() => {
    console.log('Successfully connected to local MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Local MongoDB connection failed:', err.message);
    process.exit(1);
  });
