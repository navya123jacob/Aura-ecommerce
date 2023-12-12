// Import the necessary modules

//models
const User = require('../models/userModel');

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
const users=async(req,res)=>{
    try{
        const message=req.query.message||'';
        const users=await User.find()
        res.render('users',{users})
    }
    catch (error) {
        console.log(error.message);
      }
}

//block user
const userblock=async(req,res)=>{
    try{
        const email=req.query.email
        const blockstatus=req.query.blockstatus
        console.log(email)
        
        if(blockstatus)
        {
            await User.updateOne({email},{$set:{is_blocked:true}})
            console.log('yes')
        }
        else
        {
            await User.updateOne({email},{$set:{is_blocked:false}})
        }
        
        
        res.redirect(`/admin/users`)
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
    userblock
}