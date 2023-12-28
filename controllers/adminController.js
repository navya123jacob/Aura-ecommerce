// Import the necessary modules

//models
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const order = require('../models/orderModel');
const product = require('../models/productModel');
const coupon = require('../models/couponModel');



//module for hashing password
const bcrypt = require('bcrypt');

//login
const Login=async(req,res)=>{
    try{
        const message=req.query.message||'';
        res.render('login',{message})
    }
    catch (error) {
        console.log(error.message);
      }
}

//login post
const LoginPost=async(req,res)=>{
    try{
       const admin=await User.findOne({email:req.body.email,is_Admin:1})
       if(admin)
       {
        const pass=await bcrypt.compare(req.body.password,admin.password)
        if(pass)
        {
            req.session.admincheck=admin.Fname;
            res.redirect('/admin/dashboard')

        }
        else{
            res.redirect('/admin?message=incorrect password')
        }
       }
       else{
        res.redirect('/admin?message=incorrect email')
    }

    }
    catch (error) {
        console.log(error.message);
      }
}

//dashboard
const dashboard=async(req,res)=>{
    try{
        const message=req.query.message||'';
        res.render('dashboard')
    }
    catch (error) {
        console.log(error.message);
      }
}

//user
const users = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 4; // Number of users per page
        const searchQuery = req.query.search || ''; // Get the search query

        let query = {};

        // Add search query to the database query if it exists
        if (searchQuery) {
            const regex = new RegExp(`^${searchQuery}`, 'i');
            query = { Fname: regex };
        }

        const totalUsers = await User.countDocuments(query);
        console.log(totalUsers)
        const totalPages = Math.ceil(totalUsers / pageSize);

        let users;
        if (searchQuery) {
            // Fetch all users matching the search query
            users = await User.find(query).exec();
            
           
        } else {
            // Fetch users with pagination
            users = await User.find(query)
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec();
                
        }
        res.render('users', { users, page, totalPages, searchQuery });

       
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//block user
const userblock = async (req, res) => {
    try { console.log('userblock route hit');
    console.log(req.query.blockstatus)
        console.log(req.query.email)
        const email = req.query.email;
        const blockstatus = req.query.blockstatus;
        
        if (blockstatus === 'false') {
            await User.updateOne({ email }, { $set: { is_blocked: true } });
        }
        if (blockstatus === 'true') {
            await User.updateOne({ email }, { $set: { is_blocked: false } });
        }

        const updatedUser = await User.findOne({ email }); // Fetch the updated user

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
//category view
const CategoryView=async(req,res)=>{
    try{

        const categories=await Category.find()
        res.render('category',{categories})
    }
    catch (error) {
        console.log(error.message);
      }
}

//category add
const CategoryAdd=async(req,res)=>{
    try{
       const message=req.query.message||''
        res.render('categoryAdd',{message})
    }
    catch (error) {
        console.log(error.message);
      }
}

//category add post
const CategoryAddpost=async(req,res)=>{
    try{
        const categoryName = req.body.name;
        
        // Check if a category with the same name already exists (case-sensitive)
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(req.body.name, 'i') } });

        if (existingCategory) {
            // If a category with the same name exists, redirect with an error message
            return res.redirect('/admin/categories/add?message=Category name already exists. Please choose another name.');
        }
        const Categorylist = new Category({
            name:req.body.name,
              description:req.body.description,
            status:'active'

    })
    Categorylist.save()
    res.redirect('/admin/categories/add?message=successfully added')
    }
    catch (error) {
        console.log(error.message);
      }
}

//category edit 
const CategoryEdit=async(req,res)=>{
    try{
        const editcat=await Category.findOne({_id:req.query.categoryId}) ||''
       const message=req.query.message||''
        res.render('categoryEdit',{message,editcat})

    }
    catch (error) {
        console.log(error.message);
      }
}

//category edit post
const CategoryEditpost=async(req,res)=>{
    try{
        const existingCategory = await Category.findOne({ name: req.body.name });

        if (existingCategory) {
            // If a category with the same name exists, redirect with an error message
            return res.redirect('/admin/categories/edit?message=Category name already exists. Please choose another name.');
        }
        else{
            await Category.updateOne({_id:req.query._id},{$set:{name:req.body.name,description:req.body.description}})
            res.redirect('/admin/categories')
        }
      
    }
    catch (error) {
        console.log(error.message);
      }
}

// /categories active/blocked
const CategoryToggle=async(req,res)=>{
    try{
        const cat=await Category.findOne({_id:req.query.categoryId})

        if(cat.status=='active')
        {
            await Category.updateOne({_id:req.query.categoryId},{$set:{status:'blocked'}})
        }
        else
        {
            await Category.updateOne({_id:req.query.categoryId},{$set:{status:'active'}})
        }
        res.redirect('/admin/categories')
       
    }
    
    catch (error) {
        console.log(error.message);
      }
    }



//order section
const orders = async (req, res) => {
    try {
        // for login mid
        categories = req.categories;
        ses = req.ses;
        const user = req.session.checkuser || '';
        // login mid end

        const orders = await order.find()
            .populate({
                path: 'Products.products', 
                model: 'Product'
            })
            .populate({
                path: 'user',
                model: 'User'
            })
            .exec();
  
        res.render('adminorders', { user, orders, ses, categories });
    } catch (error) {
        console.log(error.message);
    }
}

//order section
const ordersstatus = async (req, res) => {
    try {
        
        const result = await order.updateOne(
            { _id: req.body.orderId, 'Products._id': req.body.productId },
            { $set: { 'Products.$.orderStatus': req.body.status } }
          );
            
  
        res.json({success:true});
    } catch (error) {
        console.log(error.message);
    }
}
  
 
//order details
const orderdetails=async (req, res) => {
    try {
        //for logi mid
        categories = req.categories;
        ses = req.ses;
        const user = req.session.checkuser || '';
        //logi mid end
        const myorder = await order.findOne(
            { _id: req.query.orderId, 'Products._id': req.query.productId }
           ).populate({
            path: 'Products.products', 
            model: 'Product'
        }).populate({
          path: 'user',
          model: 'User'
        })
        .exec();
  
      
        let i=0
        
        for( i=0;i<myorder.Products.length;i++)
        {
          
          if (myorder.Products[i]._id==req.query.productId)
          {
            break;
          }
        }
  
        const myuser=await User.findOne({email:req.query.email})
        let j=0;
        
        for(j=0;i<myuser.addressField.length;j++)
        {
          if(myorder.address==myuser.addressField[j]._id)
          {
           
            break;
          }
        }
       
            
  
           res.render('adminorderDetails', { user,  myorder, ses, categories ,i,j,myuser});
    } catch (error) {
        console.log(error.message);
    }
  }


//coupons
const coupons= async (req, res) => {
    try {
        const message=req.query.message||''
       const coupons=await coupon.find()
        res.render('coupons', { message,coupons});

       
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//add coupons
const addcoupons= async (req, res) => {
    try {
     
        const message=req.query.message||''
        
        
        res.render('addcoupon', { message });

       
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//add coupon post 
const addcouponpost=async (req, res) => {
    try {
        const couponData = new coupon({couponName:req.body.couponName,
          couponCode:req.body.couponCode,
          discountPercent:req.body.discountPercent,
            minAmount:req.body.minAmount,
          couponDescription:req.body.couponDescription,
          
          expiryDate:req.body.expiryDate,
          })

          couponData.save()
        
        
    res.json({success:true})          
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};




//logout
const adminlogout=async(req,res)=>{
    try{
      
       req.session.destroy()  //req.session.destroy is called, it destroys the session associated with the current request based on the session ID.
       
       res.redirect('/admin')
    }
    catch (error) {
        console.log(error.message);
      }
  }

module.exports={
    Login,
    LoginPost,
    dashboard,
    users,
    userblock,
    CategoryView,
    CategoryAdd,
    CategoryAddpost,
    
    CategoryEdit,
    CategoryEditpost,
    CategoryToggle,
    orders,
    ordersstatus,
    orderdetails,
    coupons,
    addcoupons,
    addcouponpost,
    
    adminlogout
}