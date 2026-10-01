const mongoose = require('mongoose');

const TEACHERS = ['Davis', 'Jones', 'Warner'];

const studentInformationSchema = new mongoose.Schema({
  parentname: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  homeroomteacher: { type: String, enum: TEACHERS },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  studentInformation: studentInformationSchema,
});

const User = mongoose.model('User', userSchema);
User.TEACHERS = TEACHERS;

module.exports = User;
