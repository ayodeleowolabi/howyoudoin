const mongoose = require("mongoose");

const studentInformationSchema = new mongoose.Schema({
  parentname: {
    type: String
  },
  phone: {
    type: String
  },
  address:{
    type: String
  },
  homeroomteacher: {
    type: String,
    enum: ['Davis', 'Jones', 'Warner']
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  studentInformation: studentInformationSchema
  
});


const User = mongoose.model("User", userSchema);

module.exports = User;
