const express=require('express')
const adminRoute=express()
const multer = require('multer');
const path = require('path');


// Set the view engine to EJS and specify the views directory
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');


// Import the userController for handling user-related logic
const adminController = require('../controllers/adminController.js');
const productController = require('../controllers/productController.js');

const mid=require('../middleware.js')

// Set storage engine
const storage = multer.diskStorage({
    destination: 'public/admin_assets/product_images', // Set the destination folder for uploads
    filename: function (req, file, cb) {
      // // Specify how the uploaded files should be named,Set the filename to be unique
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    //   diskStorage is a storage engine provided by Multer for handling file uploads to a disk. In the context of Multer, a storage engine defines how and where the uploaded files will be stored.Multer parses the incoming form data, extracts the files, and uses the configured storage engine to handle the storage details.
}
  });
  
  // Initialize multer
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Set the file size limit to 5MB
  });


//admin login
adminRoute.get('/',mid.adminloginSes,adminController.Login)

//admin post
adminRoute.post('/loginpost',mid.adminloginSes,adminController.LoginPost)

//dashboard
adminRoute.get('/dashboard',mid.adminloginNoSes,mid.adminloginNoSes,adminController.dashboard)

//sales report
adminRoute.get('/salesreport',mid.adminloginNoSes,mid.adminloginNoSes,adminController.salesreport)



//users
adminRoute.get('/users',mid.adminloginNoSes,adminController.users)

//users
adminRoute.post('/users',mid.adminloginNoSes,adminController.users)

//user block
adminRoute.post('/users/block',mid.adminloginNoSes,adminController.userblock)

//categories
adminRoute.get('/categories',mid.adminloginNoSes,adminController.CategoryView)

//categories add
adminRoute.get('/categories/add',mid.adminloginNoSes,adminController.CategoryAdd)

//categories add post
adminRoute.post('/categories/addpost',mid.adminloginNoSes,adminController.CategoryAddpost)


//categories edit get
adminRoute.get('/categories/edit',mid.adminloginNoSes,adminController.CategoryEdit)

//categories edit post
adminRoute.post('/categories/editpost',mid.adminloginNoSes,adminController.CategoryEditpost)

//categories active/blocked
adminRoute.get('/categories/toggle',mid.adminloginNoSes,adminController.CategoryToggle)

//PRODUCTS

//to get add products
adminRoute.get('/products/add',mid.adminloginNoSes,productController.addProduct)

//to post on add products
adminRoute.post('/products/addpost',upload.array('images', 5),productController.addProductpost)//5=max num of images

//to view products
adminRoute.get('/products',mid.adminloginNoSes,productController.Product)


// products active/blocked
adminRoute.get('/products/toggle',mid.adminloginNoSes,productController.ProductToggle)

//in PRODUCT EDIT
//products edit 
adminRoute.get('/products/edit',mid.adminloginNoSes,productController.ProductEdit)

//products editpost 
adminRoute.post('/products/editpost',mid.adminloginNoSes,upload.array('newImages',5),productController.ProductEditpost)

//products edit product delete
adminRoute.get('/products/editdelete',mid.adminloginNoSes,productController.ProducteditDelete)

//orders view
adminRoute.get('/orders',mid.adminloginNoSes,adminController.orders)

//orders status change
adminRoute.post('/orders/status',mid.adminloginNoSes,adminController.ordersstatus)

//orders details on admin side
adminRoute.get('/orderdetails',mid.adminloginNoSes,adminController.orderdetails)

//to view coupons
adminRoute.get('/coupons',mid.adminloginNoSes,adminController.coupons)

//to add coupons
adminRoute.get('/couponsadd',mid.adminloginNoSes,adminController.addcoupons)

//add coupon post 
adminRoute.post('/addcouponpost',mid.adminloginNoSes,adminController.addcouponpost)

//to remove coupon
adminRoute.post('/couponremove',mid.adminloginNoSes,adminController.couponremove)


//to view offers
adminRoute.get('/offers',mid.adminloginNoSes,adminController.offers)

//to add offers
adminRoute.get('/offersAdd',mid.adminloginNoSes,adminController.addoffers)

//offer add post
adminRoute.post('/addofferpost',mid.adminloginNoSes,adminController.addofferspost)

//to remove offer
adminRoute.post('/Offerremove',mid.adminloginNoSes,adminController.offerremove)

//logout
adminRoute.get('/logout',adminController.adminlogout)

//exporting 
module.exports=adminRoute