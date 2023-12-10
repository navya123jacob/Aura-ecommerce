const express=require('express')
const userRoute=express()

// Set the view engine to EJS and specify the views directory
userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/user');

// Import the userController for handling user-related logic
const userController = require('../controllers/userController.js');

//home page
userRoute.get('/',userController.Home)

//login page
userRoute.get('/login',userController.loadLogin)


//Register page
userRoute.get('/register',userController.loadRegister)

//Post on Register page
userRoute.post('/registerpost',userController.PostRegister)







//exporting 
module.exports=userRoute