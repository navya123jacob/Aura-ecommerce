// Import necessary modules
const express = require('express');


// Login session middleware
const loginMid = (req, res, next) => {
    // Check if the user is already logged in
    if (req.session.checkuser) {
        // User is logged in, redirect to the home page
        res.redirect('/');
    } else {
        // User is not logged in, allow the request to proceed to the next middleware
        next();
    }
};
const adminloginMid = (req, res, next) => {
    if(req.session.admincheck)
    {
       
        res.redirect('/admin/dashboard')
    }
    else{
        next();
    }
    
  };
module.exports = 
{loginMid,
 adminloginMid  
}

