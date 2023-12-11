const express=require('express')
const userRoute=express()

// Set the view engine to EJS and specify the views directory
userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/user');

// Import the userController for handling user-related logic
const userController = require('../controllers/userController.js');

//login session middleware
const loginMid = (req, res, next) => {
    if(req.session.checkuser)
    {
       
        res.redirect('/')
    }
    else{
        next();
    }
    
  };

//home page
userRoute.get('/',userController.Home)

//Register page
userRoute.get('/register',loginMid,userController.loadRegister)

//Post on Register page(redirects to otp page)
userRoute.post('/registerpost',userController.PostRegister)

//to load the signup otp page
userRoute.get('/registerpostotp',userController.loadRegisterOTP)

////Post on OTP form
userRoute.post('/verifyOTP',userController.verifyUserOTP)


//login page
userRoute.get('/login',loginMid,userController.loadLogin)


//login page post
userRoute.post('/userLogin',userController.PostLogin)


//logout page post
userRoute.get('/logout',userController.logout)









//exporting 
module.exports=userRoute