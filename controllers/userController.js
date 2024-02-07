// Import the necessary modules

//models
const User = require('../models/userModel');
const UserOTP= require('../models/userOTPverify');
const product = require('../models/productModel');
const category = require('../models/categoryModel');
const cart = require('../models/cartModel');
const order = require('../models/orderModel');
const coupon = require('../models/couponModel');
const wishlist = require('../models/wishlistModel');
const Razorpay = require('razorpay');
const crypto=require('crypto');//to use SHA256 algorithm
const fs = require('fs');
const path = require('path'); 
const pdf = require('pdfkit');
const os=require('os')
const offer=require('../models/offerModel');
const banner = require('../models/bannerModel');

const invoiceDir = path.join(__dirname, 'invoices');

// Check if the directory exists, and create it if it doesn't
if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
    console.log('Created "invoices" directory.');
} else {
    console.log('The "invoices" directory already exists.');
}

// This razorpayInstance will be used to 
// access any resource from razorpay  
var instance = new Razorpay({ 
  
  key_id: process.env.RAZORPAY_ID_KEY, 

  key_secret: process.env.RAZORPAY_SECRET_KEY
}); 






const dotenv = require('dotenv');  //for securing your creditials

// Load environment variables from config.env
dotenv.config();

//module for hashing password
const bcrypt = require('bcrypt');

//to send mail using node mailer
const nodemailer = require('nodemailer');

// Function to hash a password using bcrypt
const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  };
  
  // Function to compare a plain password with its hashed version
  const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  };

  
//load Home Page
const Home=async(req,res)=>{
  try{
    
    
    const categories= await category.find({'status': 'active'})
    
   let products=[]
    const pro = await product.find({ 'status': 'active'})
    .populate({
      path: 'category',
      model: 'Category',
     
    })
    .exec();

    pro.forEach((e)=>{
      if(e.category.status=='active')
      {
        products.push(e)
      }
    })
    
//offer
let totalprice=[]
for (let i = 0; i < products.length; i ++) {
  
  if(products[i].offer==0 && products[i].category.offer==0 )
  {
    totalprice.push(products[i].price)
  }
  else{
    let discountpercent=0
    if (products[i].offer!=0)
     {let off=await offer.findOne({name:products[i].offername,status:true})
     if(off)
     {
      discountpercent = products[i].offer;
     }
     else{
      discountpercent =0;products[i].offername='';products[i].offer=0;
      await product.updateOne({_id:products[i]._id},{$set:{offername:'',offer:0}})
     }
      
  } 
  else if(products[i].category.offer!=0) 
  {
    let off=await offer.findOne({name:products[i].category.offername,status:true})
     if(off)
     {
      discountpercent = products[i].category.offer;
    }
    else{
     discountpercent =0;products[i].category.offer=0;products[i].category.offername='';
     await category.updateOne({_id:products[i].category._id},{$set:{offername:'',offer:0}})
    }
  }
  

    let newtotal = (products[i].price - (discountpercent / 100) * products[i].price).toFixed(2);
    totalprice.push(newtotal)
    
  }
  

}  

  const buser=await User.findOne({Fname:req.session.checkuser,email:req.session.email,is_blocked:true})
  if(buser)
    {
      req.session.checkuser='';
      req.session.email='';
      
    }
    let ses = false; // If checkuser doesn't exists
            
      if (req.session.checkuser) {
          // If checkuser exists in the session, set ses to true
          ses = true;
      }
      
    const user = req.session.checkuser|| '' 
    const email=req.session.email||''
   
    const banners=await banner.findOne({status:true,occasion:"HOME1"})
    const banners2=await banner.findOne({status:true,occasion:"HOME2"})
   

    const images = [];
    const adminAssetsPath = path.join('admin_assets', 'product_images');
    const separator = path.sep;
  

if (banners) {
    // Assuming this code is inside the user_Controller

    for (let j = 0; j < banners.image.length; j++) {
      const filePath = banners.image[j];
      const baseName =filePath.substring(filePath.lastIndexOf('\\') + 1); //basename nbot supported in aws
      images.push(baseName);
  }

}

    const images2 = [];
    
    if(banners2){
    for (let j = 0; j < banners2.image.length; j++) {
        const filePath = banners2.image[j];
        const baseName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        images2.push(baseName);
    }}

   let sep=path.sep
   console.log(sep)
      res.render('home',{user,ses,products,categories,email,totalprice,banners,images,banners2,images2,sep})
  }
  catch (error) {
      console.log(error.message);
    }
}


//load user login
const loadLogin=async(req,res)=>{
    try{
      
      
        const buser=await User.findOne({Fname:req.session.checkuser,email:req.session.email,is_blocked:true})
        if(buser)
          {
            req.session.checkuser='';req.session.email='';
            
          }
          let ses = false; // If checkuser doesn't exists
                  
            if (req.session.checkuser) {
                // If checkuser exists in the session, set ses to true
                ses = true;
            }
            
          const user = req.session.checkuser|| '' 
          const categories= await category.find({'status': 'active'})
              
            
            const message = req.query.message || '' 
           
              res.render('login',{message,categories,ses,user})
       
      
      
    }
    catch (error) {
        console.log(error.message);
      }
}


//load user Register
const loadRegister=async(req,res)=>{
    try{let userrefcode=req.query.refcode||'';
     
   
      if(req.session.userId)
       {
        const UserOTPVerificationRecords = await UserOTP.find({userId:req.session.userId});
      
      const { expiresAt } = UserOTPVerificationRecords[0];
      const { createdAt } = UserOTPVerificationRecords[0];

        res.redirect(`/registerpostotp?expiresAt=${expiresAt}&createdAt=${createdAt}`)
       }
       else
       {
      const buser=await User.findOne({Fname:req.session.checkuser,email:req.session.email,is_blocked:true})
      if(buser)
        {
          req.session.checkuser='';req.session.email='';
          
        }
        let ses = false; // If checkuser doesn't exists
                
          if (req.session.checkuser) {
              // If checkuser exists in the session, set ses to true
              ses = true;
          }
          
        const user = req.session.checkuser|| '' 
        const categories= await category.find({'status': 'active'})

        
      const message = req.query.message || ''  
     res.render('register',{message,ses,user,categories,userrefcode})
        }
}
   catch (error) {
    console.log(error.message);
  }
   
}


//function to sent otp verification
const sendOTPverifyEmail = async (user, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp)
    // mail options
    const mailOptions = {
      from: 'navyatjacob@gmail.com',
      to: user.email, // Use user.email instead of req.body.email
      subject: 'This is the OTP to signup to AURA',
      html: `<p>Enter ${otp} in the signup page to register</p>
             <br><p>This code expires after 2 minutes</p>`, // text or HTML or any format
    };

    // hash the otp
    const hashedOTP = await hashPassword(otp);
    const newUserOTP = await new UserOTP({
      userId: user._id, // The purpose of setting userId to user._id is to establish a link or association between the OTP verification record (in the OTPverify collection) and the corresponding user (in the User collection). 
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 120000,
    });

    // save otp record
    await newUserOTP.save()
   
    const expiresAt= newUserOTP.expiresAt
    const createdAt= newUserOTP.createdAt
    await transporter.sendMail(mailOptions);
    return {expiresAt,createdAt}
    
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    
  }
};





// Step 1: Create a transporter



const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',//The "host" typically refers to the hostname or address of the SMTP (Simple Mail Transfer Protocol) server.
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,// Your Gmail email address
    pass: process.env.EMAIL_PASSWORD,// Your Gmail email password    
  },
});
//  it's recommended to use environment variables to store sensitive information like email credentials.


//post user Register
const PostRegister=async(req,res)=>{
    try{ 
      let userrefcode=req.query.refcode||''
          
        const foundUser=await User.findOne({email:req.body.regemail})
       console.log(userrefcode)
        if(foundUser)
        {
         res.redirect('/register?message=Already registered')
        }
        else{
          
          const randomcode = Math.floor(10000 + Math.random() * 90000).toString();
          const hashedPassword = await hashPassword(req.body.password);
          const userData = new User({
          Fname:req.body.Fname,
          Lname:req.body.Lname,
          email:req.body.regemail,
          mno:req.body.mobile,
          password:hashedPassword,
          verified:false,
          is_Admin:0,
          is_blocked:false,
          refcode:randomcode
          
          });
         
          if(userrefcode)
          {
            
            const user = await User.findOne({ refcode: userrefcode.trim() });
            if(user)
            {
              
              userData.wallet=500;

            }
            
          }
         
          userData.save().then(async(result) => {
            const date=await sendOTPverifyEmail(result,res); 
            // and result saved document is also passed into user parameter
            req.session.userId =result._id   //chelpo full clear aavum ,eg: wrong otp typeythit same /registerpostotp pagilek redirect cheyumbo
            res.redirect(`/registerpostotp?userId=${req.session.userId}&expiresAt=${date.expiresAt}&createdAt=${date.createdAt}`)
            
          });
          
          
               
        }
     }
     catch (error) {
         console.log(error.message);
       }
    
}


//to load otp page after posting the signup form 
const loadRegisterOTP=async(req,res)=>{
  try{
       if(req.session.userId)
       {
       
        const buser=await User.findOne({Fname:req.session.checkuser,email:req.session.email,is_blocked:true})
        if(buser)
          {
            req.session.checkuser='';req.session.email='';
            
          }
          let ses = false; // If checkuser doesn't exists
                  
            if (req.session.checkuser) {
                // If checkuser exists in the session, set ses to true
                ses = true;
            }
            
          const user = req.session.checkuser|| '' 
          
        const categories= await category.find({'status': 'active'})

        const nowObject = new Date(Date.now());

        // Get the formatted date string
       const nowString =nowObject.toString();
       // Convert the date string to a Date object
      const newnowObject = new Date(nowString.replace('+',' '));
      // Format the date to ISO 8601 format
      const nowisoFormattedDate = newnowObject.toISOString();
      
      // Get the current minutes
     const newcurrentMinutes = newnowObject.getMinutes();


      // Convert the date string to a Date object
       const dateObject = new Date(req.query.expiresAt);

      // Format the date to ISO 8601 format
      const isoFormattedDate = dateObject.toISOString();

      // Extract the minutes
      const minutes = dateObject.getMinutes();

          const userId=req.session.userId
          const message = req.query.message ||''
          
          res.render('otp',{message,userId,isoFormattedDate,nowisoFormattedDate,user,categories,ses})
    

  }
      else{
        res.redirect('/register')
      }
  }
 catch (error) {
  console.log(error.message);
}

 
}

const outotp= async (req, res) => {
  try {
    await UserOTP.deleteMany({userId:req.session.userId});
    // Destroy the session
   
    if(User.find({userId:req.session.userId,is_verified:false})) //otp expire aan verify cheythitilel
    {
      await User.deleteOne({ _id: req.session.userId});
    }
    req.session.userId='';
    data= {
      success : true,
      
    }
    res.json(data)
  } catch (error) {
    console.log(error.message)
   }
 };


//post on otp verifaction form 
const verifyUserOTP = async (req, res) => {
  try {
    if(req.session.userId)
       {
    let {  otp } = req.body;
    
    if (! req.session.userId || !otp) {
      
      throw new Error("Empty otp details are not allowed");
    } else {
      const UserOTPVerificationRecords = await UserOTP.find({userId:req.session.userId});
      
      const { expiresAt } = UserOTPVerificationRecords[0];
      const { createdAt } = UserOTPVerificationRecords[0];
      const hashedOTP = UserOTPVerificationRecords[0].otp;
     
      if (expiresAt < Date.now()) {
        await UserOTP.deleteMany({userId:req.session.userId});
        // Destroy the session
       
        if(User.find({userId:req.session.userId,is_verified:false})) //otp expire aan verify cheythitilel
        {
          await User.deleteOne({ _id: req.session.userId});
        }
        req.session.userId='';
        data= {
          success : true,
          message:'otp expired'
        }
        res.json(data)
       
      } else {
        
        const validOTP = await bcrypt.compare(req.body.otp, hashedOTP);
        console.log(validOTP)
        if (!validOTP) {
          
          data= {
            success : false,
            message:'wrong otp,try again'
          }
          res.json(data)
        } else {
         
            await User.updateOne({ _id: req.session.userId}, { verified: true });
            await UserOTP.deleteMany({ userId:req.session.userId});
            // Destroy the session
            req.session.userId='';    //Each tab or browser is treated as a separate client by the server, and they can have different interactions with the server. Logging out from one tab doesn't automatically log out from another tab because each tab maintains its own state.
            data= {
              success : true,
            message:'successfully registered'
            }
            res.json(data)
          
        }
      }
    }
  }
  else{
    data= {
      success : true
    }
    res.json(data)
  }
  } catch (error) {
   console.log(error.message)
  }
};



//resend otp verifaction form 
const resendUserOTP = async (req, res) => {
  try {
    
    const userId=req.session.userId
    if(!userId)
    {
      throw Error('empty user details are now allowed')
    }
    else
    {
      
      await UserOTP.deleteMany({ userId:req.session.userId});
      const result=await User.findOne({_id:userId})
      
      
        const date=await sendOTPverifyEmail(result,res); 
        
        res.redirect(`/registerpostotp?message=new otp sent&userId=${userId}&expiresAt=${date.expiresAt}&createdAt=${date.createdAt}`)
        
      
    }
  }
catch (error) {
  console.log(error.message)
 }
}


//posting login page
const PostLogin=async(req,res)=>{
  try{
    
  const UserLog=await User.findOne({email:req.body.reg_email})
 
  if(UserLog )
  {
    
    const pass=await bcrypt.compare(req.body.reg_password,UserLog.password)
    
    if(!pass)
    {
      res.redirect('/login?message=Incorrect password')
    }
    else if(UserLog.is_blocked==true)
  {
    
    res.redirect('/login?message=You are blocked')
  }
  else
  {
    
    req.session.checkuser=UserLog.Fname
    req.session.email=UserLog.email
    
    res.redirect('/')
  }
}
else
{
  res.redirect('/login?message=Incorrect email')
}
}

catch(error){
  console.log(error.message)
}

}


//about 
const about = async (req, res) => {
  try {
     //for logi mid
      categories=req.categories
      ses=req.ses
      const user = req.session.checkuser|| '' 
      //logi mid end
      const userlen=await User.countDocuments()
       
      res.render('about', { categories,ses,user,userlen});
      

    
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

let so=1;
const CatProductsView = async (req, res) => {
  try {
     //for logi mid
      categories=req.categories
      ses=req.ses
      const user = req.session.checkuser|| '' 
      //logi mid end
      
    const cat = req.query.cat;
    const page = req.query.page || 1;
    const pageSize = 4; // Number of products per page

    const searchQuery = req.query.search || ''; 
    
    if(req.query.sort)
    {
      so=parseInt(req.query.sort)
   
    }
   

    let mycategory=await category.findOne({name:cat,'status':'active'})
    let products=[]
    let query={'status': 'active'}
    if(mycategory)
    {
      query.category = mycategory._id;
    }
   
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      query.name = regex;
  }

  let tot=[]
  let protot = await product.find(query).populate({
        path: 'category',
        model: 'Category'}).sort({ price: so}).exec()
        protot.forEach((e)=>{
    
          if(e.category.status=='active')
          {
            tot.push(e)
          }
        })
    
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, tot.length);
        
        for (let index = startIndex; index < endIndex; index++) {
          const e = tot[index];
         
            products.push(e);
          
        }
     
    
    const totalProducts = tot.length
    const totalPages = Math.ceil(totalProducts / pageSize);
    const email=req.session.email

    //offer
    let totalprice=[]
  for (let i = 0; i < products.length; i ++) {
    
    if(products[i].offer==0 && products[i].category.offer==0 )
    {
      totalprice.push(products[i].price)
    }
    else{
      let discountpercent=0
      if (products[i].offer!=0)
       {let off=await offer.findOne({name:products[i].offername,status:true})
       if(off)
       {
        discountpercent = products[i].offer;
       }
       else{
        discountpercent =0;products[i].offername='';products[i].offer=0;
        await product.updateOne({_id:products[i]._id},{$set:{offername:'',offer:0}})
       }
        
    } 
    else if(products[i].category.offer!=0) 
    {
      let off=await offer.findOne({name:products[i].category.offername,status:true})
       if(off)
       {
        discountpercent = products[i].category.offer;
      }
      else{
       discountpercent =0;products[i].category.offername='';products[i].category.offer=0;
       await category.updateOne({_id:products[i].category._id},{$set:{offername:'',offer:0}})
      }
    }
    
  
      let newtotal = (products[i].price - (discountpercent / 100) * products[i].price).toFixed(2);
      totalprice.push(newtotal)
      
    }
    

  }  
  
      
        res.render('categories', { products, categories, page, totalPages,cat,ses,user,email,searchQuery,totalprice,totalProducts});
      

    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


//view product details
const productdetails = async (req, res) => {
  try {
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    const email=req.session.email
    //logi mid end

    const id = req.query.id;
   
    
    const products = await product.findOne({ _id: id })
    .populate({
      path: 'category'
     
    }).exec();

    let images = [];

for (let i = 0; i < products.pictures.length; i++) {
    const filePath = products.pictures[i];
    const baseName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    images.push(baseName);
}


    if (!products) {
      // Handle the case when no product is found
      return res.status(404).send('Product not found');
    }

    let totalprice=0
 
   
    if(products.offer==0 && products.category.offer==0)
    {
      totalprice=products.price
    }
    else{
      let discountpercent=0
      if (products.offer!=0)
       {let off=await offer.findOne({name:products.offername,status:true})
       if(off)
       {
        discountpercent = products.offer;
      }
      else{
       discountpercent =0;products.offername='';products.offer=0;
       await product.updateOne({_id:products._id},{$set:{offername:'',offer:0}})
      }
    } 
    else if(products.category.offer!=0) 
    {let off=await offer.findOne({name:products.category.offername,status:true})
    if(off)
    {
        discountpercent = products.category.offer;
      }
      else{
       discountpercent =0;products.category.offer=0;products.category.offername='';
       await category.updateOne({_id:products.category._id},{$set:{offername:'',offer:0}})
      }
    }
      
      let newtotal = (products.price - (discountpercent / 100) * products.price).toFixed(2);
      totalprice=newtotal
    }

  var k=0;
    res.render('productdeets', { products ,categories,ses,user,email,k,images,totalprice});
  } catch (error) {
    console.log(error.message);
    // Handle other errors as needed
    res.status(500).send('Internal Server Error');
  }
};


//to add products to cart

const productaddtocart = async (req, res) => {
  try {
    const pro=await product.findOne({name:req.query.name })
    
   const currentuser=await User.findOne({email:req.session.email })
   const quantity=req.query.qtyValue||1
   

    // Check if the user already has a cart document
    const cartFind = await cart.findOne({ user: currentuser._id });
    
    if (cartFind) {
      // User already has a cart document
     
      const existingProduct = cartFind.Products.find(   // findOne is more suitable when you're querying the entire collection for a single document based on some conditions. Here looking for a product within an array, so find is appropriate.
        (product) => product.name === pro.name
      );
      

      if (existingProduct) {
        // Product is already in the cart, increase the quantity
        if(req.query.cart)
        {
          existingProduct.quantity = parseInt(quantity);
          
        }
        else
        {
          existingProduct.quantity += parseInt(quantity);
        }
        
        
       
        existingProduct.total = existingProduct.quantity *existingProduct.price
        
      } else {
        
        // Product is not in the cart, add it to the product array
        cartFind.Products.push({
          products: pro._id,
          price: pro.price,
          name: pro.name,
          quantity: quantity,
          total:quantity* pro.price
        });
      }
      
      await cartFind.save();
    } else {
      
      // User does not have a cart document, creating a new one
      const cartAdd = new cart({
        user: currentuser._id,
        Products: [
          {
            products: pro._id,
            price: pro.price,
            name: pro.name,
            quantity: quantity,
            total:pro.price*quantity
          }
        ],
       
      });

      

      await cartAdd.save();
    }

    res.json({ success: false, message: 'added' });
  } catch (error) {
    console.log(error.message);
  }
};//Once you retrieve a document from the collection, you can make changes to its properties and then call the .save() method to persist those changes to the database


//to remove products from cart

const productremovefromcart = async (req, res) => {
  try {
    const pro=await product.findOne({name:req.query.name })
    
    const currentuser=await User.findOne({email:req.session.email })
   
    await cart.updateOne({user:currentuser._id}, { $pull: { 'Products': { 'products': pro._id} } })
   res.json({success:true})

  } catch (error) {
    res.json({success:false})
  }
}


//load cart
const cartload=async(req,res)=>{
  try{
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const checkmessage=req.query.checkmessage||''
    
    const email=req.session.email
    const myuser=await User.findOne({email:req.session.email})
    const usercart = await cart
    .findOne({ user: myuser._id })
    .populate({
      path: 'Products.products',
      populate: {
        path: 'category',
        select: 'offername offer',
      },
    })
    .exec();
  
    let Total = 0;
    let shipping = 0;
    let grandtotal = 0;
    let b=0;
    
   

    let totalproprice=[];let proprice=[]
    if (usercart && usercart.Products[0]) {
      b=1
      
      
      for (const prod of usercart.Products) {
        let productPrice = parseFloat(prod.total);
        let individualprice = prod.price;
        let discountpercent = 0;
      
        if (prod.products.offer !== 0 || prod.products.category.offer !== 0) {
            let off;
    
            if (prod.products.offer != 0) {
                off = await offer.findOne({ name: prod.products.offername, status: true });
            } else if (prod.products.category.offer != 0) {
                off = await offer.findOne({ name: prod.products.category.offername, status: true });
               
            }
    
            if (off) {
                discountpercent = prod.products.offer || prod.products.category.offer;
    
                const discountAmount = (discountpercent / 100) * productPrice;
                const discountedPrice = productPrice - discountAmount;
                productPrice = discountedPrice.toFixed(2);
                individualprice = (individualprice - ((discountpercent / 100) * individualprice)).toFixed(2);
            } else {
                if(prod.products.offer !== 0)
                {
                  await product.updateOne({ _id: prod.products._id }, { $set: { offername: '', offer: 0 } });
                }
                else{
                  await category.updateOne({ _id: prod.products.category._id }, { $set: { offername: '', offer: 0 } });       
                }
               
               
           
            }
        }
    
        Total = Total + parseFloat(productPrice);
        totalproprice.push(parseFloat(productPrice));
        proprice.push(parseFloat(individualprice));
    
        if (prod.products.quantity === 0) {
            await cart.updateOne({ user: myuser._id }, { $pull: { 'Products': { 'products': prod.products } } });
            totalproprice.pop();
            proprice.pop();
        }
    }
    
      usercart.Products = usercart.Products.filter((product) => product.products.quantity != 0);
      
        if (Total < 500) {
            shipping = 40;
        }

        grandtotal = Total + shipping;
    }
    
    
      res.render('cart',{user,ses,categories,usercart,shipping,Total,grandtotal,b,email,checkmessage,totalproprice,proprice})
   
      
  }
  catch (error) {
      console.log(error.message);
    }
}


//add products to wishlist
const productaddtowishlist = async (req, res) => {
  try {
    const pro=await product.findOne({name:req.query.name })
    
   const currentuser=await User.findOne({email:req.session.email })
   
    

    // Check if the user already has a cart document
    const wishFind = await wishlist.findOne({ user: currentuser._id });
    
    if (wishFind) {
      // User already has a cart document
     
      const existingProduct = await wishFind.Products.find(   // findOne is more suitable when you're querying the entire collection for a single document based on some conditions. Here looking for a product within an array, so find is appropriate.
        (product) => product.name === pro.name
      );
      

      if (existingProduct) {
        res.json({ success: false, message: 'Already added' });
        
      } else {
        // Product is not in the cart, add it to the product array
        wishFind.Products.push({
          products: pro._id,
          price: pro.price,
          name: pro.name
        });
      }


      await wishFind.save();
      res.json({ success: true, message: 'Added' });
    } else {
      // User does not have a cart document, create a new one
      const wishAdd = new wishlist({
        user: currentuser._id,
        Products: [
          {
            products: pro._id,
            price: pro.price,
            name: pro.name
          }
        ],
       
      });

      

      await wishAdd.save();
      res.json({ success: true, message: 'added' });
    }

   
  } catch (error) {
    console.log(error.message);
  }
}

//To load wishlist

//load cart
const wishlistload=async(req,res)=>{
  try{
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const checkmessage=req.query.checkmessage||''
    
    const email=req.session.email
    const myuser=await User.findOne({email:req.session.email})
    const userwish=await wishlist.findOne({user:myuser._id}).populate('Products.products').exec() // Use the actual field name you defined in your schema
    let b=0;
    if(userwish)
    {
      b=1
    }
    
      res.render('wishlist',{user,ses,categories,userwish,email,checkmessage,b})
   
      
  }
  catch (error) {
      console.log(error.message);
    }
}



//to remove products from wishlist

const productremovefromwish = async (req, res) => {
  try {
    const pro=await product.findOne({name:req.query.name })
    
    const currentuser=await User.findOne({email:req.session.email })
   
    await wishlist.updateOne({user:currentuser._id}, { $pull: { 'Products': { 'products': pro._id} } })
   res.json({success:true})

  } catch (error) {
    res.json({success:false})
  }
}

//proceed to checkout page
const checkout=async(req,res)=>{
  try{
   
    
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const myuser=await User.findOne({email:req.session.email})
    const usercart = await cart
  .findOne({ user: myuser._id })
  .populate({
    path: 'Products.products',
    populate: {
      path: 'category', 
      select: 'offername', 
      select: 'offer'
    },
  })
  .exec();
    let Total = 0;
    let shipping = 0;
    let grandtotal = 0;
    let b=0;let c=0;
    
    
    let coupons=[];
   
let couponfind = await coupon.find({ 'status': true });

// Filter out coupons where user_id is equal to myuser._id
couponfind = couponfind.filter(co => {
  const userUsedIds = co.userUsed.map(user => user.user_id.toString());
  if (!userUsedIds.includes(myuser._id.toString())) {
    coupons.push(co);
    return false; // Do not include in couponfind array
  }
  return true; // Include in couponfind array
});
    
    if (myuser &&  myuser.addressField.length > 0)
    {
      c=1
      
    }
    let applied_coupon=req.query.couponapplied||''
    
    let couponmessage=''


    //to check if coupon already used
    const couponcheck = await coupon.findOne({
      'couponCode': applied_coupon,
      'userUsed.user_id': { $in: [myuser._id] }
    });
    
    
    let totalproprice=[];let proprice=[]
    if (usercart && usercart.Products[0]) {
      b=1
      let Total = 0;
      
      usercart.Products.forEach(async(product)=> {
        let productPrice = parseFloat(product.total);
        let individualprice=product.price;let discountpercent=0

        
        if(product.products.category.offer != 0)
        {
          discountpercent=product.products.category.offer
        }
        if(product.products.offer != 0)
        {
          discountpercent=product.products.offer
        }
        
        if (product.products.offer != 0 ||product.products.category.offer!= 0 ) {
            const discountAmount = (discountpercent / 100) * productPrice;
            const discountedPrice = productPrice - discountAmount;
            productPrice = discountedPrice.toFixed(2);
            individualprice=(individualprice-((discountpercent / 100) * individualprice)).toFixed(2);
        }
    
        Total = Total + parseFloat(productPrice);
        totalproprice.push(parseFloat(productPrice))
        proprice.push(parseFloat(individualprice))
        if(product.products.quantity==0)
          {
            await cart.updateOne({user:myuser._id}, { $pull: { 'Products': { 'products': product.products} } })
            totalproprice.pop();proprice.pop();
          }
    });
    
        if (Total < 500) {
            shipping = 40;
        }
   
        grandtotal = Total + shipping;
        let couponmessage=''

        if(applied_coupon)
    {
      const currentcoupon=await coupon.findOne({'status':true,'couponCode':applied_coupon})
      if(currentcoupon)
      {
        if(couponcheck)
        {
          
          couponmessage=`Already used`;
        }
        else if(currentcoupon.minAmount<=grandtotal)
        {
          grandtotal = (grandtotal-((currentcoupon.discountPercent/100)*grandtotal)).toFixed(2)         
        }
        else{
         
          couponmessage=`minimum amount is ${currentcoupon.minAmount}`
        }
       
      }
      else{
        
        couponmessage=`invalid coupon code`;
        
      }
      
    }
        res.render('checkout',{user,ses,categories,usercart,shipping,Total,grandtotal,b,myuser,c,coupons,applied_coupon,couponmessage,totalproprice})
    }
    
    else
    {
      res.redirect('/cart?checkmessage=Add products to checkout')
    }
    
      
  }
  catch (error) {
      console.log(error.message);
    }
}


//razorpay function
function generateRazorpay(orderId,total){
  return new Promise((resolve,reject)=>{
    var options={
      amount:total*100,
      currency:"INR",
      receipt:orderId
    }
    instance.orders.create(options,function(err,order){
      console.log("new order",order)
      resolve(order)
    })

  })
}

//proceed to checkout page
const placeorder=async(req,res)=>{
  try{
    
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const myuser=await User.findOne({email:req.session.email})
    const usercart = await cart
  .findOne({ user: myuser._id })
  .populate({
    path: 'Products.products',
    populate: {
      path: 'category', 
      select: 'offername', 
      select: 'offer'
    },
  })
  .exec();
    let Total = 0;
    let shipping = 0;
    let grandtotal = 0;
    let b=0;let c=0
   
    let cond=true;let name='';let quantityamount=0;
    let totalproprice=[];let proprice=[]
    if (usercart && usercart.Products[0]) {
      b=1
      let Total = 0;
      
      usercart.Products.forEach(async(prod)=> {
        let productPrice = parseFloat(prod.total);
        let individualprice=prod.price;let discountpercent=0
        
        if(prod.products.category.offer != 0)
        {
          discountpercent=prod.products.category.offer
        }
        if(prod.products.offer != 0)
        {
          discountpercent=pro.products.offer
        }
        
        if (prod.products.offer != 0 ||prod.products.category.offer!= 0 ) {
            const discountAmount = (discountpercent / 100) * productPrice;
            const discountedPrice = productPrice - discountAmount;
            productPrice = discountedPrice.toFixed(2);
            individualprice=(individualprice-((discountpercent / 100) * individualprice)).toFixed(2);
        }
        
        Total = Total + parseFloat(productPrice);
        totalproprice.push(parseFloat(productPrice))
        proprice.push(parseFloat(individualprice))
        
        if(prod.quantity>prod.products.quantity || prod.quantity<=0)
          {
            name=prod.products.name;
            cond=false;
            quantityamount=prod.products.quantity
            
          }
    });
   

        if (Total < 500) {
            shipping = 40;
        }

        grandtotal = Total + shipping;
    }
    if(cond==false){
      res.json({ success: 'insuff',check:true,name,quantityamount})
    }
    else{
    
    const newOrderData = new order({
      user: myuser._id,
      paymentMode: req.body.paymentOption,
      total: grandtotal,
      address: req.body.existingAddress,
      date: new Date(),
      Products: usercart.Products.map((product, index) => ({
          products: product.products,
          name: product.name,
          price: proprice[index],
          quantity: product.quantity,
          total: proprice[index] * product.quantity,
      })),
  });
  if(req.body.couponCodeInput)
  {
    const currentcoupon=await coupon.findOne({'status':true,'couponCode':req.body.couponCodeInput})
    if(currentcoupon)
    {
      newOrderData.couponcode=req.body.couponCodeInput;
      newOrderData.Totalbefore=grandtotal
      newOrderData.total=(grandtotal-((currentcoupon.discountPercent/100)*grandtotal)).toFixed(2)
    }
    
  }

  
await newOrderData.save()
.then(order => {
  
  const productsToUpdate = order.Products.map(product => ({
    _id: product._id,
    name:product.name,
    quantity: product.quantity
  }));
  
 
  productsToUpdate.forEach(async(pro) => {
   
    await product.updateOne(
      { name: pro.name }, { $inc: { quantity: -pro.quantity } });
   
   
  });
 
})
.catch(error => {
  console.error(error);
});


if (req.body.paymentOption === 'cashOnDelivery') {
  await order.updateOne({ _id: newOrderData._id }, { $set: { paymentstatus: 'placed' } });
  res.json({ success: 'cod',oid:newOrderData._id })}
else if (req.body.paymentOption === 'wallet') {
  if(myuser.wallet>=newOrderData.total)
  {
    await order.updateOne({ _id: newOrderData._id }, { $set: { paymentstatus: 'placed' } });
    await User.updateOne(
      { email: req.session.email },
      { $inc: { wallet:-newOrderData.total } }
    );
    res.json({ success: 'wal',check:true,oid:newOrderData._id })
  }
  else{
    let diff=newOrderData.total-myuser.wallet
    let orderid=newOrderData._id
    res.json({ success: 'wal',check:false,wallet:myuser.wallet,diff,orderid})
  }
  }
  
  
else
{

  generateRazorpay(newOrderData._id,newOrderData.total).then((response)=>{
    response.success='razor';
    
    res.json(response)})


}
    }


} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: error.message });
}
}

//split payment 
const splitorder=async(req,res)=>{
  try{
   
    generateRazorpay(req.body.currentid,req.body.difference).then((response)=>{
      response.success='razor';
      
      res.json(response)})
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
    }
    }
    

//verifying razorpay payment
const verifyrazorpayment=async(req,res)=>{
  try{
   
    const { order: {receipt,amount}, payment: { razorpay_payment_id, razorpay_order_id,razorpay_signature } } = req.body;     
    
    const key_secret = process.env.RAZORPAY_SECRET_KEY      
  
    // STEP 8: Verification & Send Response to User 
      
    // Creating hmac object  
    let hmac = crypto.createHmac('sha256', key_secret);  
  
    // Passing the data to be hashed 
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id); 
      
    // Creating the hmac in the required format 
    hmac = hmac.digest('hex'); 
      
     
    if(razorpay_signature==hmac){ 
      
      if(!req.query.wallet)
      {const orderwallet=await order.findOne({_id: receipt})
        if(orderwallet.paymentMode=='wallet')
      {
        await User.updateOne(
          { email: req.session.email },
          { $set: { wallet:0} }
        );
      }
        await order.updateOne({ _id: receipt }, { $set: { paymentstatus: 'placed' } });
      }
      else{ const realamount=(amount/100).toFixed(2)
        await User.updateOne(
          { email: req.session.email },
          { $inc: { wallet:realamount } }
        );
      }
      
      res.json({ success: true,orderid:receipt})
    } 
    else
    {
    
      
      res.json({ success: false, message: 'Payment verification failed' });
    }
    }
    
  
  catch (error) {
      console.log(error.message);
    }
}

//order placed
const orderplaced=async(req,res)=>{
  try{
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const myuser=await User.findOne({email:req.session.email})
    const usercart=await cart.findOne({user:myuser._id}).populate('Products.products').exec() // Use the actual field name you defined in your schema
    
    

    const email=req.session.email
    const orderid=req.query.orderid
   
    const ordermade = await order.findOne({ _id: orderid })
  .populate({
    path: 'Products.products',
    model: 'Product'
  })
  .populate({
    path: 'user',
    model: 'User'
  })
  .exec();

  const couponcheck = await coupon.findOne({
    'couponCode': ordermade.couponcode,
    'userUsed.user_id': { $in: [myuser._id] }
  });
  if (ordermade.couponcode && !couponcheck) {
    await coupon.updateOne(
      { couponCode: ordermade.couponcode },
      {
        $addToSet: {
          userUsed: { user_id: myuser._id }
        }
      }
    );
  }
  const userorder=await User.findOne({email:req.session.email})
      let j=0;
      
      for(j=0;j<myuser.addressField.length;j++)
      {
        if(ordermade.address==userorder.addressField[j]._id)
        {
         
          break;
        }
      }
    const invoicePath = generateInvoice(ordermade, userorder.addressField[j]);
    if (usercart && usercart.Products[0]) {
     
      await cart.updateOne({user:myuser._id},{$set:{Products:[]}})    
        res.render('orderplaced',{user,ses,categories,usercart,orderid})
      
    }
    
    else
    {
      res.redirect('/cart?checkmessage=Add products to checkout')
    }
    
      
  }
  catch (error) {
      console.log(error.message);
    }
}

//to get invoice
// invoice 
const getInvoice = (req, res) => {
  try {
      console.log('invoice ')
      const orderId = req.params.id;
      const invoicePath = path.join(__dirname, 'invoices', `invoice_${orderId}.pdf`);

      // Set appropriate headers for the PDF download
      res.setHeader('Content-disposition', `attachment; filename=invoice_${orderId}.pdf`);
      res.setHeader('Content-type', 'application/pdf');

      // Create a readable stream from the invoice file and pipe it to the response
      const fileStream = fs.createReadStream(invoicePath);
      fileStream.pipe(res);
  } catch (error) {
      console.log(error.message)
  }
}

//to generate invoice
function generateInvoice(order, selectedAddrss) {
  const invoicePath = path.join(__dirname, 'invoices', `invoice_${order._id}.pdf`);
  const doc = new pdf();

  // Pipe the PDF to a writable stream and create the invoice
  doc.pipe(fs.createWriteStream(invoicePath));

  // Set font and font size
  doc.font('Helvetica-Bold');
  doc.fontSize(14);

  // Company Name
  doc.text('AURA', { align: 'center' });

  // Add a horizontal line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();
  // Invoice Header
  doc.fontSize(12).text('Invoice', { align: 'center' }).fontSize(12);
  doc.moveDown();
  // Order ID
  doc.text(`Order ID: ${order._id}`);
  doc.moveDown();
  // Product details
  doc.fontSize(14).text('Product Details', { underline: true });

  for (let i = 0; i < order.Products.length; i++) {
    const product = order.Products[i];
    doc.text(`Item ${i + 1}: ${product.name}`);
    doc.text(`Quantity: ${product.quantity}`);
    doc.text(`Price:  Rs. ${product.price}`);
    doc.moveDown(); // Move to the next line
  }

  // Total
  doc.fontSize(12).text(`Total:  Rs.${order.total}`);

  // Payment mode
  doc.text(`Payment mode: ${order.paymentMode}`);
  doc.moveDown();
  // Address section
  doc.fontSize(14).text('Shipping Address', { underline: true });

  doc.text(`Name: ${selectedAddrss.name}`);
  doc.text(`Phone: ${selectedAddrss.phone}`);
  doc.text(`Address: ${selectedAddrss.address}`);
  doc.text(`District: ${selectedAddrss.district}`);
  doc.text(`State: ${selectedAddrss.state}`);
  doc.text(`Pincode: ${selectedAddrss.pincode}`);
  

  doc.end(); // Finalize the PDF

  return invoicePath;
}

  

//USER ACCOUNT
//load user account
const account=async(req,res)=>{
  try{
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const myuser=await User.findOne({email:req.session.email})
    const refcode=myuser.refcode
   
      res.render('account',{user,ses,categories,myuser,refcode})
  }
  catch (error) {
      console.log(error.message);
    }
}

//post on user account
const accountpost=async(req,res)=>{
  try{
      await User.updateOne({email:req.session.email}
        ,{$set:{Fname:req.body.Fname,
                 Lname:req.body.Lname,
                mno:req.body.mobile}})
                res.redirect('/account')
  }
  catch (error) {
      console.log(error.message);
    }
}

//to view and add address
const accountaddress=async(req,res)=>{
  try{
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const myuser=await User.findOne({email:req.session.email})
    const email=req.session.email
  
      res.render('address',{user,ses,categories,myuser,email})
  }
  catch (error) {
      console.log(error.message);
    }
}

//to add new address
const addaddress=async(req,res)=>{
  try{
    await User.updateOne({email:req.session.email}
      ,{$push: {
        addressField: {
            name: req.body.addressName,
            phone: req.body.addressPhone,
            district: req.body.addressDistrict,
            state:req.body.addressState,
            pincode:req.body.addressPincode,
            address:req.body.addressDetails
 
        }
      }
    })

    
    res.json({success:true})
  }
  catch (error) {
    res.json({success:false})
    }
}

//to edit address
const editaddress=async(req,res)=>{
  try{
    const addressfind=await User.findOne({ email: req.session.email})
   
    const specificaddress= addressfind.addressField.find((add) => add.address === req.body.realaddress);
    
   
if (specificaddress) {
  specificaddress.name = req.body.name;
  specificaddress.district = req.body.district;
  specificaddress.address = req.body.address;
  specificaddress.state = req.body.state;
  specificaddress.pincode = parseInt(req.body.pincode);
  specificaddress.phone = req.body.phone;

  try {
    await addressfind.save();
    
} catch (error) {
    console.error('Error saving address:', error);
}
}
  

    
    res.json({success:true})
  }
  catch (error) {
    res.json({success:false})
    }
}

//to remove address
const removeaddress=async(req,res)=>{
  try{
    
    const result = await User.updateOne(
      { email: req.body.useremail },
      { $pull: { addressField: { address: req.body.useraddress } } }
    );
  
    res.json({success:true})
  }
  catch (error) {
    res.json({success:false})
    }
}

//order section
const orders = async (req, res) => {
  try {
    let startdate=req.query.start||'';
    let enddate=req.query.end||'';
      //for logi mid
      categories = req.categories;
      ses = req.ses;
      const user = req.session.checkuser || '';
      //logi mid end
      const cat = req.query.cat;
      const page = req.query.page || 1;
      const pageSize = 4;
      const myuser = await User.findOne({ email: req.session.email });
      let orders=[]
      await order.deleteMany({paymentstatus:'pending'})
      let ord = await order.find({ user: myuser._id })
          .populate({
              path: 'Products.products', 
              model: 'Product'
          }).skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean()
          let totord = await order.find({ user: myuser._id }).populate({
            path: 'Products.products', 
            model: 'Product'
        }).exec();
        let overall=[];
          if(!req.query.start)
          {
            overall=[...totord]
            orders=[...ord]
          }
          else{
            let startDate = new Date(req.query.start);
let endDate = new Date(req.query.end);

totord.forEach((e)=>{
  let orderDateObj = new Date(e.date);
 if(orderDateObj >= startDate && orderDateObj <= endDate)
 {
   overall.push(e)
 }
})
const startIndex = (page - 1) * pageSize;
const endIndex = Math.min(startIndex + pageSize, overall.length);

for (let index = startIndex; index < endIndex; index++) {
  const e = overall[index];
 
    orders.push(e);
  
}

}

        
          const totalProducts = overall.length;
          const totalPages = Math.ceil(totalProducts / pageSize);
          const email=req.session.email
          
      res.render('orders', { user, orders, ses, categories,cat,page, totalPages,email });
  } catch (error) {
      console.log(error.message);
  }
}

//to return or cancel a order
//order section
const ordersstatus = async (req, res) => {
  try {
      
      const result = await order.updateOne(
          { _id: req.body.orderId, 'Products._id': req.body.productId },
          { $set: { 'Products.$.orderStatus': req.body.newStatus,'Products.$.reason': req.body.reason} }
        );
          

      res.json({success:true});
  } catch (error) {
      console.log(error.message);
  }
}

//to see order details
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

      const myuser=await User.findOne({email:req.session.email})
      let j=0;
      
      for(j=0;j<myuser.addressField.length;j++)
      {
        if(myorder.address==myuser.addressField[j]._id)
        {
         
          break;
        }
      }
     
          

         res.render('orderDetails', { user,  myorder, ses, categories ,i,j,myuser});
  } catch (error) {
      console.log(error.message);
  }
}


//to see wallet
const wallet = async (req, res) => {
  try {
    // For login middleware
    const categories = req.categories;
    const ses = req.ses;
    const user = req.session.checkuser || '';

    
    const myuser = await User.findOne({ email: req.session.email });

   
    const currentWalletAmount = myuser.wallet;

    // Round the wallet amount to two decimal places
    const roundedWalletAmount = parseFloat(currentWalletAmount.toFixed(2));

   
    myuser.wallet = roundedWalletAmount;

    await myuser.save();
    res.render('wallet', { user, ses, categories, myuser });
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately, such as sending an error response
    res.status(500).send('Internal Server Error');
  }
};


//to see wallet history
const wallethistory=async (req, res) => {
  try {
    
      //for logi mid
      categories = req.categories;
      ses = req.ses;
      const user = req.session.checkuser || '';
      //logi mid end
      const myuser = await User.findOne({ email: req.session.email });
      
         res.render('wallethistory', { user, ses, categories,myuser});
  } catch (error) {
      console.log(error.message);
  }
}

//to add wallet money via razorpay
const addwalletMoney = async (req, res) => {
  try {
    const orderId = generateOrderId();
    let amount=req.body.amountValue;
    const response = await generateRazorpay(orderId, amount);
    response.success = 'razor';
    res.json(response);
  } catch (error) {
    console.error('Error in addwalletMoney:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
function generateOrderId() {
  const{v4:uuidv4}=require('uuid')
  const orderId = uuidv4();
  return orderId;
}



//logout
const logout=async(req,res)=>{
  try{
    
    
    req.session.checkuser=''  //req.session.destroy is called, it destroys the session associated with the current request based on the session ID.;

    req.session.email='' 
     res.redirect('/')
  }
  catch (error) {
      console.log(error.message);
    }
}

module.exports={
    loadLogin,
    Home,
    loadRegister,
    PostRegister,
    loadRegisterOTP,
    verifyUserOTP,
    PostLogin,
    logout,
    CatProductsView,
    productdetails,
    resendUserOTP,
    outotp,
    account,
    cartload,
    productaddtocart,
    productremovefromcart,
    accountpost,
    accountaddress,
    addaddress,
    editaddress,
    removeaddress,
    checkout,
    placeorder,
    splitorder,
    orderplaced,
    orders,
    ordersstatus,
    orderdetails,
    verifyrazorpayment,
    wallet,
    wallethistory,
    addwalletMoney,
    getInvoice,
    productaddtowishlist,
    wishlistload,
    productremovefromwish,
    about
    
   
}