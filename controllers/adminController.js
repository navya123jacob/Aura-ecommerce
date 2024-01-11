// Import the necessary modules

//models
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const order = require('../models/orderModel');
const product = require('../models/productModel');
const coupon = require('../models/couponModel');
const offer = require('../models/offerModel');



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
        const pageSize = 6; // Number of users per page
        const searchQuery = req.query.search || ''; // Get the search query

        let query = {};

        // Add search query to the database query if it exists
        if (searchQuery) {
            const regex = new RegExp(`^${searchQuery}`, 'i');
            query = { Fname: regex };
        }

        const totalUsers = await User.countDocuments(query);
       
        const totalPages = Math.ceil(totalUsers / pageSize);

        let users;
        if (searchQuery) {
            // Fetch all users matching the search query
            users = await User.find(query).skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();
            
           
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
           
            res.json({success:false,message:'This category is already added'})
        }
        else{
            console.log('no')
            const Categorylist = new Category({
                name:req.body.name,
                  description:req.body.description,
                status:'active'
    
        })
        await Categorylist.save()
        res.json({success:true})
        }
        
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
       console.log(message)
        res.render('categoryEdit',{message,editcat})

    }
    catch (error) {
        console.log(error.message);
      }
}

//category edit post
const CategoryEditpost=async(req,res)=>{
    try{
        const existingCategory = await Category.findOne({ "name": new RegExp('^' + req.body.name + '$', 'i') });
        const presentcat=await Category.findOne({_id:req.query._id});
       
        if (existingCategory && (presentcat.name.toLowerCase() !=  req.body.name.toLowerCase() )) {
          
              
                res.json({success:false,message:'Category name already exists. Please choose another name.',catid:req.query._id})
          
       
        }
        else{
            await Category.updateOne({_id:req.query._id},{$set:{name:req.body.name,description:req.body.description}})
            res.json({success:true,message:'Edited'})
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

        const page = parseInt(req.query.page) || 1;
        const pageSize = 3; // Number of users per page
        const searchQuery = req.query.search || ''; // Get the search query

        
        await order.deleteMany({paymentstatus:'pending'})

          let orders;
          let query={}

          if (searchQuery) {
            const regex = new RegExp(`^${searchQuery}`, 'i');
           query={
            'Products': {
                $elemMatch: {
                  'name': regex
                }
          }
        }
            orders = await order.find(query)
            .populate({
              path: 'Products.products',
              model: 'Product'
            })
            .populate({
              path: 'user',
              model: 'User'
            })
            .exec();
            
          }

       else{
        orders = await order.find()
        .populate({
            path: 'Products.products', 
            model: 'Product'
        })
        .populate({
            path: 'user',
            model: 'User'
        })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
       }
    
       

            const totalProducts = await order.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / pageSize);

       
  
        res.render('adminorders', { user, orders, ses, categories ,searchQuery,page, totalPages,});
    } catch (error) {
        console.log(error.message);
    }
}

//order section
const ordersstatus = async (req, res) => {
    try {
        const mongoose = require('mongoose');
       const ObjectId = mongoose.Types.ObjectId;
       
        await order.updateOne(
            { _id: req.body.orderId, 'Products._id':new ObjectId(req.body.productId) },
            { $set: { 'Products.$.orderStatus': req.body.status } }
          );
          
          let walletmoney=0;
            if(req.body.status=='returned'||req.body.status=='cancelled')
            {
                const result = await order.aggregate([
                    {
                      $match: {
                        _id: new ObjectId(req.body.orderId),
                        'Products._id': new ObjectId(req.body.productId)
                      }
                    },
                    {
                      $project: {
                        'Products': {
                          $filter: {
                            input: '$Products',
                            as: 'product',
                            cond: { $eq: ['$$product._id', new ObjectId(req.body.productId)] }
                          }
                        },
                        total: 1,
                        couponcode: 1,
                        user:1,
                        paymentMode:1
                      }
                    },
                    {
                      $unwind: '$Products'
                    },
                    {
                      $project: {
                        productTotal: '$Products.total',
                        quantity: '$Products.quantity',
                        total: 1,
                        couponcode: 1,
                        user:1,
                        paymentMode:1
                      }
                    }
                  ]);
                  
                 
                  console.log(req.body.proname)
                  await product.updateOne(
                    { name: req.body.proname }, { $inc: { quantity: result[0].quantity } });
                   walletmoney=result[0].productTotal;
                  console.log(walletmoney)
                 const appliedcoupon= await coupon.findOne({couponCode:result[0].couponcode})
                 if(appliedcoupon)
                 {
                    walletmoney=result[0].productTotal-((result[0].productTotal)*(appliedcoupon.discountPercent)/100)
                    
                    console.log(walletmoney)
                    
                    
                 }
                if(result[0].paymentMode=='cashOnDelivery' && req.body.status=='cancelled')
                {
                    walletmoney=0
                }
                

                await User.updateOne(
                    { _id: result[0].user },
                    { $inc: { wallet: walletmoney } }
                );
                  if(walletmoney!=0)
            {
                const walletEntry = {
                    amount: walletmoney, 
                    description: `Amount refunded on order payed via ${result[0].paymentMode}`, 
                    date: new Date() ,
                    status:req.body.status
                };
                
                await User.updateOne(
                    { _id: result[0].user }, 
                    { $push: { walletHistory: walletEntry } } // Update operation
                );
            }
            }
            
  
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

        const pageSize = 5; // Number of products per page
        const page = parseInt(req.query.page) || 1;
        const searchQuery = req.query.search || '';
        let query = {};
        let coupons;
        if (searchQuery) {
          const regex = new RegExp(`^${searchQuery}`, 'i');
          query = {couponName: regex};
          
      }
      
      
      const totalProducts = await coupon.countDocuments(query);
     
    const totalPages = Math.ceil(totalProducts / pageSize);
       coupons=await coupon.find(query).skip((page - 1) * pageSize)
       .limit(pageSize)
       .exec();
       
        res.render('coupons', { message,coupons,searchQuery, page, totalPages});

       
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//add coupons
const addcoupons= async (req, res) => {
    try {
     
        const message=req.query.message||''
        
        
       
        res.render('addcoupon', { message});

       
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
          Availability:req.body.availability,
          expiryDate:req.body.expiryDate,
          })

          couponData.save()
        
        
    res.json({success:true})          
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//remove coupon
const couponremove=async (req, res) => {
    try {
        
        const pro=await coupon.deleteOne({couponName:req.query.name })
    
        
    res.json({success:true})          
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//to view offers
const offers= async (req, res) => {
    try {
        const message=req.query.message||''

        const pageSize = 5; // Number of products per page
        const page = parseInt(req.query.page) || 1;
        const searchQuery = req.query.search || '';
        let query = {};
        let offers;
        if (searchQuery) {
          const regex = new RegExp(`^${searchQuery}`, 'i');
          query = {name: regex};
          
      }
      
      
      const totalProducts = await offer.countDocuments(query);
     
    const totalPages = Math.ceil(totalProducts / pageSize);
       offers=await offer.find(query).skip((page - 1) * pageSize)
       .limit(pageSize)
       .exec();
       
        res.render('offers', { message,offers,searchQuery, page, totalPages});

       
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//add offers
const addoffers= async (req, res) => {
    try {
     
        const message=req.query.message||''
        
        
       
        res.render('offerAdd', { message});

       
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
    couponremove,
    offers,
    addoffers,
    
    adminlogout
}