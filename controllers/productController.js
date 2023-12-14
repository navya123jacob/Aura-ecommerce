//models
const product = require('../models/productModel');
const Category = require('../models/categoryModel');
const path = require('path');



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
        
        const arr = req.files.map(file => file.path);
         // Create a new Product document using Mongoose model
    const newProduct = new product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        quantity: req.body.quantity,
        date: req.body.date,
        pictures: arr // Assuming 'images' is an array in your Mongoose model.req.files is an array that contains information about all the uploaded files. Each element in this array is an object with details about a single uploaded file. The .map() function is then used to create a new array containing only the paths of the uploaded files.
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

//products view
const Product=async(req,res)=>{
    try{
       const products=await product.find()
        res.render('product',{products})
    }
    catch(error)
    {
        console.log(error.message)
    }
}

//products delete
const ProductDelete=async(req,res)=>{
    try{
        await product.deleteOne({_id:req.query.id})
        res.redirect('/admin/products')
       
    }
    
    catch (error) {
        console.log(error.message);
      }
    }

// /products active/blocked
const ProductToggle=async(req,res)=>{
    try{
        const prod=await product.findOne({_id:req.query.id})

        if(prod.status=='active')
        {
            await product.updateOne({_id:req.query.id},{$set:{status:'blocked'}})
        }
        else
        {
            await product.updateOne({_id:req.query.id},{$set:{status:'active'}})
        }
        res.redirect('/admin/products')
       
    }
    
    catch (error) {
        console.log(error.message);
      }
    }

    //in EDIT PRODUCT
    //products edit get
const ProductEdit=async(req,res)=>{
    try{
       const editProduct=await product.findOne({_id:req.query.id})

        res.render('productsEdit',{editProduct})
    }
    catch(error)
    {
        console.log(error.message)
    }
}


//post form

    const ProductEditpost = async (req, res) => {
        try {
           const newarr = req.files.map(file => file.path);
           await product.updateOne(
            { _id: req.query.id },
            {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    quantity: req.body.quantity,
                },
                $push: {
                    pictures: {
                        $each: newarr
                    }
                }
            } 
        )
        res.redirect(`/admin/products/edit?id=${req.query.id}`)
        }
      catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  };

  //to delete product inside post form
  const ProducteditDelete =async(req,res)=>{
    try{
        console.log(req.query.img)
        await product.updateOne(
            { _id: req.query.id },
            {
                $pull: {
                    pictures: req.query.img
                }
            }
        );
        const editProduct=await product.findOne({_id:req.query.id})
        
        res.redirect(`/admin/products/edit?id=${req.query.id}`)
       
    }
    
    catch (error) {
        console.log(error.message);
      }
    }

  
  
module.exports=
{
    addProduct,
    addProductpost,
    Product,
    ProductDelete,
    ProductToggle,
    ProductEdit,
    ProductEditpost,
    ProducteditDelete
    
}