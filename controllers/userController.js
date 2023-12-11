// Import the necessary modules

//models
const User = require('../models/userModel');
const UserOTP= require('../models/userOTPverify');

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
      let ses = false; // If checkuser doesn't exists
              
        if (req.session.checkuser) {
            // If checkuser exists in the session, set ses to true
            ses = true;
        }
        
      const user = req.session.checkuser|| '' 
     
        res.render('home',{user,ses})
    }
    catch (error) {
        console.log(error.message);
      }
}



//load user login
const loadLogin=async(req,res)=>{
    try{
      const message = req.query.message || '' 
        res.render('login',{message})
    }
    catch (error) {
        console.log(error.message);
      }
}


//load user Register
const loadRegister=async(req,res)=>{
    try{
      const message = req.query.message || ''  //remember this always
     res.render('register',{message})
}
   catch (error) {
    console.log(error.message);
  }
   
}


//function to sent otp verification
const sendOTPverifyEmail = async (user, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);
    console.log(user.email);
    // mail options
    const mailOptions = {
      from: 'navyatjacob@gmail.com',
      to: user.email, // Use user.email instead of req.body.email
      subject: 'This is the OTP to signup to AURA',
      html: `<p>Enter ${otp} in the signup page to register</p>
             <br><p>This code expires after 15 minutes</p>`, // text or HTML or any format
    };

    // hash the otp
    const hashedOTP = await hashPassword(otp);
    const newUserOTP = await new UserOTP({
      userId: user._id, // The purpose of setting userId to user._id is to establish a link or association between the OTP verification record (in the OTPverify collection) and the corresponding user (in the User collection). 
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
    });

    // save otp record
    await newUserOTP.save();
    await transporter.sendMail(mailOptions);
    
    userId=user._id; //to access during otp verification
    
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
    
          userData.save().then((result) => {
            sendOTPverifyEmail(result,res); // Pass req as a parameter
            // and result saved document is also passed into user parameter
            req.session.userId =result._id   //chelpo full clear aavum ,eg: wrong otp typeythit same /registerpostotp pagilek redirect cheyumbo
            res.redirect(`/registerpostotp`)
            
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
    const message = req.query.message ||''
    res.render('otp',{message})
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
      const hashedOTP = UserOTPVerificationRecords[0].otp;
     
      if (expiresAt < Date.now()) {
        await UserOTP.deleteMany({userId:req.session.userId});
        // Destroy the session
       
        if(User.find({userId:req.session.userId,is_verified:false})) //otp expire aan verify cheythitilel
        {
          await User.deleteOne({ _id: req.session.userId});
        }
        req.session.destroy();
        res.redirect('/register?message=otp expired')
       
      } else {
        
        const validOTP = await bcrypt.compare(req.body.otp, hashedOTP);
        console.log(validOTP)
        if (!validOTP) {
          // await User.deleteOne({ _id: userId })
          // await UserOTP.deleteMany({ userId }
          res.redirect("/registerpostotp?message=wrong otp,try again")
          
        } else {
         
            await User.updateOne({ _id: req.session.userId}, { verified: true });
            await UserOTP.deleteMany({ userId:req.session.userId});
            // Destroy the session
            req.session.destroy();
            res.redirect('/register?message=Successfully registered')
          
        }
      }
    }
  }
  else{
    res.redirect('/register')
  }
  } catch (error) {
   console.log(error.message)
  }
};



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
    logout
}