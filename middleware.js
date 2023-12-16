// Import necessary modules
const express = require('express');


// Login session middleware
const UserNoSes = (req, res, next) => {
    // Check if the user is already logged in
    if (!req.session.checkuser) {
        // User is logged in, redirect to the home page
        res.redirect('/');
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
    console.log(req.session.admincheck)
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

module.exports = 
{UserNoSes,
 adminloginSes,
 adminloginNoSes,
 UserNoSes,
 UserSes
}