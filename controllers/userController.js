// Import the necessary modules

//models
const User = require('../models/userModel');
const OTPverify = require('../models/userOTPverify');

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
        res.render('home')
    }
    catch (error) {
        console.log(error.message);
      }
}



//load user login
const loadLogin=async(req,res)=>{
    try{
        res.render('login')
    }
    catch (error) {
        console.log(error.message);
      }
}

//load user Register
const loadRegister=async(req,res)=>{
    try{
      console.log(process.env.AUTH_EMAIL)
    var message=''

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
    const newOTPverify = await new OTPverify({
      userId: user._id, // Assuming _id is the user's ID
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    // save otp record
    await newOTPverify.save();
    await transporter.sendMail(mailOptions);

    
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
    user: 'navyatjacob@gmail.com',// Your Gmail email address
    pass: 'ikhr splm kruz dhwo',// Your Gmail email password    
  },
});
//  it's recommended to use environment variables to store sensitive information like email credentials.


//post user Register
const PostRegister=async(req,res)=>{
    try{ 
        const foundUser=await User.findOne({email:req.body.regemail})
       
        if(foundUser)
        {
         res.render('register',{message:'already registered email'})
        }
        else{
          const hashedPassword = await hashPassword(req.body.password);
          const userData = new User({
          Fname:req.body.Fname,
          Lname:req.body.Lname,
          email:req.body.regemail,
          mno:req.body.mobile,
          password:hashedPassword,
          verified:true,
          is_Admin:0
          });
    
          userData.save().then((result) => {
            sendOTPverifyEmail(result,res); // Pass req as a parameter
          });
          
          res.render('register',{message:'registered'})
               
        }
     }
     catch (error) {
         console.log(error.message);
       }
    
}



module.exports={
    loadLogin,
    Home,
    loadRegister,
    PostRegister
}