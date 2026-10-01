require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const seedDemo = require('./scripts/seed-demo');

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Make sure the demo account exists when the demo login is advertised
  if (process.env.SHOW_DEMO_LOGIN === 'true') {
    await seedDemo({ onlyIfMissing: true }).catch((err) => console.error('Demo seed failed:', err));
  }

  const port = process.env.PORT || '3000';
  app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
  });
})();
