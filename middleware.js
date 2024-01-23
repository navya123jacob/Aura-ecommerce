// Import necessary modules
const express = require('express');
//models
const User = require('./models/userModel');
const UserOTP= require('./models/userOTPverify');
const product = require('./models/productModel');
const category = require('./models/categoryModel');


//registerpost
const otpmid = async(req, res, next) => {
    if(req.session.userId)
    {
     const UserOTPVerificationRecords = await UserOTP.find({userId:req.session.userId});
   
   const { expiresAt } = UserOTPVerificationRecords[0];
   const { createdAt } = UserOTPVerificationRecords[0];

     res.redirect(`/registerpostotp?expiresAt=${expiresAt}&createdAt=${createdAt}`)
    }  else {
       
        next();
    }
};
    

// Login session middleware
const UserNoSes = (req, res, next) => {
    // Check if the user is already logged in
    if (!req.session.checkuser) {
        // User is logged in, redirect to the home page
        res.redirect('/login');
    } else {
        // User is not logged in, allow the request to proceed to the next middleware
        next();
    }
};
// Login session middleware
const UserSes = (req, res, next) => {
    // Check if the user is already logged in
    if (req.session.checkuser) {
        // User is logged in, redirect to the home page
        res.redirect('/');
    } else {
        // User is not logged in, allow the request to proceed to the next middleware
        next();
    }
};
const adminloginNoSes = (req, res, next) => {
    
    if(!req.session.admincheck)
    {

        res.redirect('/admin')
    }
    
    
    else{
        next();
    }
    
  };

  const adminloginSes = (req, res, next) => {
    if(req.session.admincheck)
    {
       
        res.redirect('/admin/dashboard')
    }
    else{
        next();
    }
    
  };

  let categories; // Declare categories outside the if block
  const logiheader= async(req, res, next) => {
    let ses = false; // If checkuser doesn't exists
   
    
  const buser=await User.findOne({Fname:req.session.checkuser,is_blocked:true})
      if(buser)
        {
          req.session.checkuser='';req.session.email='';
          
        }
        
                
          if (req.session.checkuser) {
              // If checkuser exists in the session, set ses to true
              ses = true;
          }
          
          req.ses=ses
        
        req.categories= await category.find({'status': 'active'})
     
      await next()
    };

module.exports = 
{UserNoSes,
 adminloginSes,
 adminloginNoSes,
 UserNoSes,
 UserSes,
 logiheader,
 otpmid
}