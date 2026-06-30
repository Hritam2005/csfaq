import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';

// Setup file for Jest
// You can use this to establish an in-memory MongoDB connection for tests later.
// For now, we will mock the connection in our tests.

afterAll(async () => {
  // Ensure mongoose connections are closed after tests
  await mongoose.disconnect();
});
