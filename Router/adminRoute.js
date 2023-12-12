const express=require('express')
const adminRoute=express()

// Set the view engine to EJS and specify the views directory
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

// Import the userController for handling user-related logic
const adminController = require('../controllers/adminController.js');

const mid=require('../middleware.js')


//admin login
adminRoute.get('/',mid.adminloginMid,adminController.Login)

//admin post
adminRoute.post('/loginpost',mid.adminloginMid,adminController.LoginPost)

//dashboard
adminRoute.get('/dashboard',adminController.dashboard)

//users
adminRoute.get('/users',adminController.users)

//user block
adminRoute.get('/users/block',adminController.userblock)

//exporting 
module.exports=adminRoute