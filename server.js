require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session');
const app = express();
const addUserToReqAndLocals = require('./middleware/addUserToReqAndLocals');
const ensureLoggedIn = require('./middleware/ensureLoggedIn');


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});




app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(addUserToReqAndLocals);





app.use('/auth', require('./controllers/auth'));
app.use('/todos', require('./controllers/todos'));
app.use('/student/information', ensureLoggedIn, require('./controllers/studentinformation'));
app.use('/student/reviews', ensureLoggedIn, require('./controllers/reviews'));






app.get('/', async (req, res) => {
  res.render('home.ejs');
});



const port = process.env.PORT ? process.env.PORT : "3000";


app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
