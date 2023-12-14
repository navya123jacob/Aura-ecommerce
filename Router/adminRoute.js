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
  const upload = multer({  //upload: The initialized multer instance.upload.array processes the uploaded files and makes them available in the req.files array within the route handler,when uploading image files through form
    storage: storage,
    limits: { fileSize: 1000000 } // Set a file size limit (optional)
  })
  


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

//categories
adminRoute.get('/categories',adminController.CategoryView)

//categories add
adminRoute.get('/categories/add',adminController.CategoryAdd)

//categories add post
adminRoute.post('/categories/addpost',adminController.CategoryAddpost)

//categories delete get
adminRoute.get('/categories/delete',adminController.CategoryDelete)

//categories edit get
adminRoute.get('/categories/edit',adminController.CategoryEdit)

//categories edit post
adminRoute.post('/categories/editpost',adminController.CategoryEditpost)

//categories active/blocked
adminRoute.get('/categories/toggle',adminController.CategoryToggle)

//PRODUCTS

//to get add products
adminRoute.get('/products/add',productController.addProduct)

//to post on add products
adminRoute.post('/products/addpost',upload.array('images', 5),productController.addProductpost)//5=max num of images

//to view products
adminRoute.get('/products',productController.Product)

//to delete products
adminRoute.get('/products/delete',productController.ProductDelete)

// products active/blocked
adminRoute.get('/products/toggle',productController.ProductToggle)

//in PRODUCT EDIT
//products edit 
adminRoute.get('/products/edit',productController.ProductEdit)

//products editpost 
adminRoute.post('/products/editpost',upload.array('newImages',5),productController.ProductEditpost)

//products edit product delete
adminRoute.get('/products/editdelete',productController.ProducteditDelete)

//exporting 
module.exports=adminRoute