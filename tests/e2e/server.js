// Starts the app against a throwaway database for Playwright.
const mongoose = require('mongoose');

(async () => {
  let uri = process.env.MONGODB_TEST_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    uri = server.getUri();
  }
  await mongoose.connect(uri, { dbName: `e2e-${Date.now()}` });
  await mongoose.connection.dropDatabase();

  const app = require('../../app');
  const port = process.env.PORT || 3100;
  app.listen(port, () => console.log(`E2E server ready on http://127.0.0.1:${port}`));
})();
