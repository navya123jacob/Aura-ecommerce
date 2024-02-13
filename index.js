const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv').config();
const morgan=require('morgan')


const app = express();

 mongoose.connect(process.env.MONGO_URL); //process.env is a Node.js global object that provides access to the environment variables. 


const userRoute = require('./Router/userRoute');


const adminRoute = require('./Router/adminRoute');

//to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname,'public')))

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


app.use('/', userRoute);


app.use('/admin', adminRoute);


const port = process.env.PORT || 3000;


app.listen(port, () => {
  console.log('Listening at http://localhost:3000');
});


