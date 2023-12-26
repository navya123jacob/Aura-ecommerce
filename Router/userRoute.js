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
userRoute.get('/category',  mid.logiheader, userController.CatProductsView);

//to view product details
userRoute.get('/productdetails',mid.logiheader,userController.productdetails)

//to view account
userRoute.get('/account',mid.UserNoSes,mid.logiheader,userController.account)

//to post on user account
userRoute.post('/account/edit',mid.UserNoSes,userController.accountpost)

//to get address 
userRoute.get('/address',mid.UserNoSes,mid.logiheader,userController.accountaddress)

//to submit new address
userRoute.post('/submit-address',userController.addaddress)

//to delete address
userRoute.post('/removeaddress',userController.removeaddress)

//to edit address
userRoute.post('/editaddress',userController.editaddress)

//to view cart
userRoute.get('/cart',mid.UserNoSes,mid.logiheader,userController.cartload)

//proceed to checkout
userRoute.get('/checkout',mid.UserNoSes,mid.logiheader,userController.checkout)

//place order
userRoute.post('/placeorder',mid.UserNoSes,mid.logiheader,userController.placeorder)

//placed order
userRoute.get('/orderplaced',mid.UserNoSes,mid.logiheader,userController.orderplaced)

//see orders
userRoute.get('/orders',mid.UserNoSes,mid.logiheader,userController.orders)

//to return or cancel a order
userRoute.put('/orders/status',mid.UserNoSes,mid.logiheader,userController.ordersstatus)

//see order details
userRoute.get('/orderdetails',mid.UserNoSes,mid.logiheader,userController.orderdetails)


//to add product to cart
userRoute.post('/productaddtocart',userController.productaddtocart)

//to remove from cart
userRoute.post('/productremovefromcart',userController.productremovefromcart)







//logout page post
userRoute.get('/logout',mid.UserNoSes,userController.logout)



//exporting 
module.exports=userRoute