// Import the necessary modules

//models
const User = require('../models/userModel');
const Category = require('../models/categoryModel');


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
       
        
        if(blockstatus==='false')
        {
            await User.updateOne({email},{$set:{is_blocked:true}})
            
        }
        if(blockstatus==='true')
        {
            await User.updateOne({email},{$set:{is_blocked:false}})
        }
        
        
        res.redirect(`/admin/users`)
    }
    catch (error) {
        console.log(error.message);
      }
}

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

//category delete
const CategoryDelete=async(req,res)=>{
    try{
        await Category.deleteOne({_id:req.query.categoryId})
        res.redirect('/admin/categories')
       
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
        await Category.updateOne({_id:req.query._id},{$set:{name:req.body.name,description:req.body.description}})
        res.redirect('/admin/categories')
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



module.exports={
    Login,
    LoginPost,
    dashboard,
    users,
    userblock,
    CategoryView,
    CategoryAdd,
    CategoryAddpost,
    CategoryDelete,
    CategoryEdit,
    CategoryEditpost,
    CategoryToggle
}