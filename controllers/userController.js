// Import the necessary modules

//models
const User = require('../models/userModel');
const UserOTP= require('../models/userOTPverify');
const product = require('../models/productModel');
const category = require('../models/categoryModel');
const cart = require('../models/cartModel');
const order = require('../models/orderModel');


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
    
   
    const products = await product.find({ 'status': 'active' })
  .populate({
    path: 'category', //The path: 'category' specifies the field in the current document that you want to populate. In this case, you are populating the 'category' field of the 'Product' model.
    match: { 'status': 'active' }
  })
  .exec(); //The .exec() method is used to execute the query
  const buser=await User.findOne({Fname:req.session.checkuser,is_blocked:true})
  if(buser)
    {
      req.session.checkuser=''
      
    }
    let ses = false; // If checkuser doesn't exists
            
      if (req.session.checkuser) {
          // If checkuser exists in the session, set ses to true
          ses = true;
      }
      
    const user = req.session.checkuser|| '' 
   
   
      res.render('home',{user,ses,products,categories})
  }
  catch (error) {
      console.log(error.message);
    }
}


//load user login
const loadLogin=async(req,res)=>{
    try{
      const buser=await User.findOne({Fname:req.session.checkuser,is_blocked:true})
  if(buser)
    {
      req.session.checkuser=''
      
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
    try{
      const buser=await User.findOne({Fname:req.session.checkuser,is_blocked:true})
      if(buser)
        {
          req.session.checkuser=''
          
        }
        let ses = false; // If checkuser doesn't exists
                
          if (req.session.checkuser) {
              // If checkuser exists in the session, set ses to true
              ses = true;
          }
          
        const user = req.session.checkuser|| '' 
        const categories= await category.find({'status': 'active'})
        
      const message = req.query.message || ''  //remember this always
     res.render('register',{message,ses,user,categories})
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
      
        const foundUser=await User.findOne({email:req.body.regemail})
       
        if(foundUser)
        {
         res.redirect('/register?message=Already registered')
        }
        else{
          const hashedPassword = await hashPassword(req.body.password);
          const userData = new User({
          Fname:req.body.Fname,
          Lname:req.body.Lname,
          email:req.body.regemail,
          mno:req.body.mobile,
          password:hashedPassword,
          verified:false,
          is_Admin:0,
          is_blocked:false
          });
    
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
       
        const buser=await User.findOne({Fname:req.session.checkuser,is_blocked:true})
        if(buser)
          {
            req.session.checkuser=''
            
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
      console.log(nowString)
      // Get the current minutes
     const newcurrentMinutes = newnowObject.getMinutes();

     console.log('ISO Formatted Date:', nowisoFormattedDate);
     console.log('Minutes:', newcurrentMinutes);
     
        

      // Convert the date string to a Date object
       const dateObject = new Date(req.query.expiresAt);

      // Format the date to ISO 8601 format
      const isoFormattedDate = dateObject.toISOString();

      // Extract the minutes
      const minutes = dateObject.getMinutes();

      console.log('ISO Formatted Date:', isoFormattedDate);
      console.log('Minutes:', minutes);

      
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
        req.session.destroy();
        data= {
          success : true,
          message:'otp expired'
        }
        res.json(data)
       
      } else {
        
        const validOTP = await bcrypt.compare(req.body.otp, hashedOTP);
        console.log(validOTP)
        if (!validOTP) {
          // await User.deleteOne({ _id: userId })
          // await UserOTP.deleteMany({ userId }
          data= {
            success : false,
            message:'wrong otp,try again'
          }
          res.json(data)
        } else {
         
            await User.updateOne({ _id: req.session.userId}, { verified: true });
            await UserOTP.deleteMany({ userId:req.session.userId});
            // Destroy the session
            req.session.destroy();    //Each tab or browser is treated as a separate client by the server, and they can have different interactions with the server. Logging out from one tab doesn't automatically log out from another tab because each tab maintains its own state.
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
  console.log(req.body)
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



const CatProductsView = async (req, res) => {
  try {
     //for logi mid
      categories=req.categories
      ses=req.ses
      const user = req.session.checkuser|| '' 
      //logi mid end

    const cat = req.query.cat;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 4; // Number of products per page


    const totalProducts = await product.countDocuments({ 'status': 'active' });
    const totalPages = Math.ceil(totalProducts / pageSize);

    let mycategory=await category.findOne({name:cat,'status':'active'})
    let products=''
    if(mycategory)
    {
      products = await product
      .find({ 'status': 'active',category:mycategory._id })
      .populate({
        path: 'category'
       //The match option in populate is used to filter the documents from the original collection, not the documents from the referenced collection.
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean() 
    }

   
      
        res.render('categories', { products, categories, page, totalPages,cat,ses,user});
      

    
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
   
     
      
    if (!products) {
      // Handle the case when no product is found
      return res.status(404).send('Product not found');
    }
    const productlist = await product.aggregate([
      {
          $lookup: {
              from: 'categories', // Assuming your category collection is named 'categories'
              localField: 'category',
              foreignField: '_id',
              as: 'categoryData'
          }
      },
      {
          $match: {
              'status': 'active',
              'categoryData.status': 'active',
              'products._id':{$ne:req.query.id}
          }
      }
  ]);

  var k=0;
    res.render('productdeets', { products ,productlist,categories,ses,user,email,k});
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
      console.log(pro.name)

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
      // User does not have a cart document, create a new one
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
    const usercart=await cart.findOne({user:myuser._id}).populate('Products.products').exec() // Use the actual field name you defined in your schema
    let Total = 0;
    let shipping = 0;
    let grandtotal = 0;
    let b=0;
    
    if (usercart && usercart.Products[0]) {
      b=1
        usercart.Products.forEach(product => {
            Total = Total + product.total;
        });

        if (Total < 500) {
            shipping = 40;
        }

        grandtotal = Total + shipping;
    }
    
    
      res.render('cart',{user,ses,categories,usercart,shipping,Total,grandtotal,b,email,checkmessage})
   
      
  }
  catch (error) {
      console.log(error.message);
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
    const usercart=await cart.findOne({user:myuser._id}).populate('Products.products').exec() // Use the actual field name you defined in your schema
    let Total = 0;
    let shipping = 0;
    let grandtotal = 0;
    let b=0;let c=0
    
    if (myuser &&  myuser.addressField.length > 0)
    {
      c=1
      
    }
    
    
    if (usercart && usercart.Products[0]) {
      b=1
        usercart.Products.forEach(product => {
            Total = Total + product.total;
        });

        if (Total < 500) {
            shipping = 40;
        }

        grandtotal = Total + shipping;
        res.render('checkout',{user,ses,categories,usercart,shipping,Total,grandtotal,b,myuser,c})
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

//proceed to checkout page
const placeorder=async(req,res)=>{
  try{
    //for logi mid
    categories=req.categories
    ses=req.ses
    const user = req.session.checkuser|| '' 
    //logi mid end
    const myuser=await User.findOne({email:req.session.email})
    const usercart=await cart.findOne({user:myuser._id}).populate('Products.products').exec() // Use the actual field name you defined in your schema
    let Total = 0;
    let shipping = 0;
    let grandtotal = 0;
    let b=0;let c=0
   
    
    if (usercart && usercart.Products) {
      b=1
        usercart.Products.forEach(product => {
            Total = Total + product.total;
        });

        if (Total < 500) {
            shipping = 40;
        }

        grandtotal = Total + shipping;
    }
    
    
    const newOrderData = new order({
      user: myuser._id,
      paymentMode: req.body.paymentOption,
      total: grandtotal,  
      address: req.body.existingAddress,
      date: new Date(),
      Products: usercart.Products.map(product => ({
          products: product.products,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          total: product.price * product.quantity,
         
      })),
  });

  
await newOrderData.save();
await cart.updateOne({user:myuser._id},{$set:{Products:[]}})
res.redirect('/orderplaced')

} catch (error) {
console.error(error);
res.status(500).json({ success: false, error: error.message });
}
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
    
   
      res.render('account',{user,ses,categories,myuser})
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
    console.log(specificaddress)
   
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



//logout
const logout=async(req,res)=>{
  try{
    
    
     req.session.destroy()  //req.session.destroy is called, it destroys the session associated with the current request based on the session ID.
     
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
    placeorder
}