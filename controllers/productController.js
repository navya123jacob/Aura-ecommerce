//models
const product = require('../models/productModel');
const Category = require('../models/categoryModel');
const path = require('path');
const fs=require('fs')



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

// products view with pagination
const Product = async (req, res) => {
  try {
    const pageSize = 5; // Number of products per page
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search || '';
   
    let query = {};
    if (searchQuery) {
      const regex = new RegExp(`^${searchQuery}`, 'i');
      query = {name: regex};
      
  }
  const totalProducts = await product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / pageSize);
   

    let products;
    if (searchQuery) {
      
      products = await product
      .find(query)
      .populate({
        path: 'category',
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
      
     
  }
  else
  {
    products = await product
      .find()
      .populate({
        path: 'category',
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
  }

     

    res.render('product', { products, page, totalPages,searchQuery});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

//products delete
const ProductDelete=async(req,res)=>{
    try{

        // Find the product document to get the list of images
        const productToDelete = await product.findOne({ _id: req.query.id });
        console.log(productToDelete)
        // Loop through each image and delete it from the public directory
        for (const imagePath of productToDelete.pictures) {
            const fullPath = path.join(__dirname, '..', 'public', imagePath);
           fs.unlink(fullPath, (err) => {
  if (err) {
    console.error('Error deleting file:', err);
  } else {
    console.log('File deleted successfully');
  }
});
        }
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
        
        const imagePath = path.join(__dirname, '..',  req.query.img);
        console.log(imagePath)
        // Delete the image file from the public directory
        fs.unlink(imagePath, (err) => {
  if (err) {
    console.error('Error deleting file:', err);
  } else {
    console.log('File deleted successfully');
  }
});
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