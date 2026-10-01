require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

const port = process.env.PORT || '3000';
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
