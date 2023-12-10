const express = require('express');
const mongoose = require('mongoose');


// Create an Express application
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Aura');

// Import userRoute (assuming you have a userRoute file)
const userRoute = require('./Router/userRoute');

//to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

//for no caching
const nocache = require('nocache');

//cookie and session
const session=require('express-session')
const{v4:uuidv4}=require('uuid')
app.use(nocache()); //wont cache session details
app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true
}))

// Use the userRoute for requests at the root ('/')
app.use('/', userRoute);

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Listening at http://localhost:3000');
});
