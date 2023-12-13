//models
const product = require('../models/productModel');
const Category = require('../models/categoryModel');

//admin side add product
const addProduct=async(req,res)=>{
    try{
        const message=req.query.message||''
        const categories=await Category.find()
        res.render('productAdd',{categories,message})
    }
    catch(error)
    {
        console.log(error.message)
    }
}

//admin side add product post
const addProductpost=async(req,res)=>{
    try{
        let arr = []
        console.log(req.files)
        const {path} = req.files[0];
        console.log(req.files[0])
        arr.push(path)
         console.log(arr)

        console.log('yes')
         // Create a new Product document using Mongoose model
    const newProduct = new product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        quantity: req.body.quantity,
        date: req.body.date,
        images: arr // Assuming 'images' is an array in your Mongoose model.req.files is an array that contains information about all the uploaded files. Each element in this array is an object with details about a single uploaded file. The .map() function is then used to create a new array containing only the paths of the uploaded files.
      });
  
      // Save the new Product document to the database
      await newProduct.save();
      res.redirect('/admin/products/add?message=product added')
    }
    catch(error)
    {
        console.log(error.message)
    }
}


module.exports=
{
    addProduct,
    addProductpost
}