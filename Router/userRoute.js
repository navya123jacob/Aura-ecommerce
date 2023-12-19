const express=require('express')
const userRoute=express()

// Set the view engine to EJS and specify the views directory
userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/user');

// Import the userController for handling user-related logic
const userController = require('../controllers/userController.js');

const mid=require('../middleware.js');
const Product = require('../models/productModel.js');


//home page
userRoute.get('/',userController.Home)

//Register page
userRoute.get('/register',mid.UserSes,userController.loadRegister)

//Post on Register page(redirects to otp page)
userRoute.post('/registerpost',userController.PostRegister)

//to load the signup otp page
userRoute.get('/registerpostotp',userController.loadRegisterOTP)

//Post on OTP form
userRoute.post('/verifyOTP',userController.verifyUserOTP)

//send on OTP form
userRoute.get('/resendOTP',userController.resendUserOTP)


//login page
userRoute.get('/login',mid.UserSes,userController.loadLogin)


//login page post
userRoute.post('/userLogin',userController.PostLogin)





// Categories products view
userRoute.get('/category', mid.UserNoSes, mid.logiheader, userController.CatProductsView);

//to view product details
userRoute.get('/productdetails',mid.UserNoSes,mid.logiheader,userController.productdetails)

//to view account
userRoute.get('/account',mid.UserNoSes,userController.account)







//logout page post
userRoute.get('/logout',mid.UserNoSes,userController.logout)



//exporting 
module.exports=userRoute