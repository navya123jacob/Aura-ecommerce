// Import the necessary modules

//models
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const order = require('../models/orderModel');
const product = require('../models/productModel');
const coupon = require('../models/couponModel');
const offer = require('../models/offerModel');
const fs = require('fs');
const path = require('path'); 
const pdf = require('pdfkit');
const os=require('os')

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
        let prodlen=await product.countDocuments();
        let catlen=await Category.countDocuments();
        let totalUsers = await User.countDocuments();
        let salesdash = await order.aggregate([
          {
            $match: {
              "Products.orderStatus": { $nin: ["returned", "cancelled"] }
            }}])
            let saleslen=salesdash.length
            
        //revenue
        let revenue=await order.aggregate([
            {
              $match: {
                "Products.orderStatus": { $in: ["placed", "delivered"] },
                "paymentMode":{ $in: ["razorpay", "wallet"] } 
              }
            },
            {
              $unwind: "$Products"
            },
            {
              $match: {
                "Products.orderStatus": { $in: ["placed", "delivered"] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$Products.total" }
              }
            }
          ]);
          let revenue2 = await order.aggregate([
            {
              $match: {
                "Products.orderStatus": "delivered",
                paymentMode: "cashOnDelivery"
              }
            },
            {
              $unwind: "$Products"
            },
            {
              $match: {
                "Products.orderStatus": "delivered",
                paymentMode: "cashOnDelivery"
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$Products.total" }
              }
            }
          ]);
          
          let pending=await order.aggregate([
            {
              $match: {
                "Products.orderStatus": { $ne:  "delivered" }
              }
            }
          ]);
          let revenuelen=revenue[0].total+revenue[0].total;
          let pendlen=pending.length;
         
          //area chart
          //for orders yearly
          const chartYearData = await order.aggregate([
            {
              $match: {
                "Products.orderStatus": { $nin: ["returned", "cancelled"] }
              }
            },
            {
              $group: {
                _id: { $year: "$date" },
                count: { $sum: 1 }
              }
            },
            {
              $sort: {
                _id: 1
              }
            }
          ]);
          
  let  labels=[2021, 2022, 2023, 2024, 2025];let yeardata=[];
  for(let i=0;i<labels.length;i++)
  {let val=0
    for(let j=0;j<chartYearData.length;j++)
    {
        if(labels[i]==chartYearData[j]._id)
        {
            b=true;
            val=chartYearData[j].count;
           break;
            
        }
        
    }
   yeardata.push(val)
  }
 
  //for users yearly
  const chartUserData = await User.aggregate([
    {
      $group: {
        _id: { $year: "$date" }, 
        count: { $sum: 1 } 
      }
    },
    {
      $sort: {
        _id: 1 
      }
    }
  ]);
  let yearuser=[];
  for(let i=0;i<labels.length;i++)
  {let val=0
    for(let j=0;j<chartUserData.length;j++)
    {
        if(labels[i]==chartUserData[j]._id)
        {
            b=true;
            val=chartUserData[j].count;
           break;
            
        }
        
    }
    yearuser.push(val)
  }

  //for orders monthly
  const orderdatamonth = await order.aggregate([
    {
      $match: {
        "Products.orderStatus": { $nin: ["returned", "cancelled"] }
      }
    },
    {
      $group: {
        _id: { $month: "$date" }, 
        count: { $sum: 1 } 
      }
    },
    {
      $sort: {
        _id: 1 
      }
    }
  ]);
  let  labelsmonth=[1,2,3,4,5,6,7,8,9,10,11,12];let monthorder=[];
  for(let i=0;i<labelsmonth.length;i++)
  {let val=0
    for(let j=0;j<orderdatamonth.length;j++)
    {
        if(labelsmonth[i]==orderdatamonth[j]._id)
        {
            b=true;
            val=orderdatamonth[j].count;
           break;
            
        }
        
    }
    monthorder.push(val)
  }


  //for users monthly
  const userdatamonth = await User.aggregate([
    {
      $group: {
        _id: { $month: "$date" }, 
        count: { $sum: 1 } 
      }
    },
    {
      $sort: {
        _id: 1 
      }
    }
  ]);
  let monthuser=[];
  for(let i=0;i<labelsmonth.length;i++)
  {let val=0
    for(let j=0;j<userdatamonth.length;j++)
    {
        if(labelsmonth[i]==userdatamonth[j]._id)
        {
            b=true;
            val=userdatamonth[j].count;
           break;
            
        }
        
    }
    monthuser.push(val)
  }

  //for barchart
  const barprofit = await order.aggregate([
    {
      $match: {
        "Products.orderStatus": "delivered"
      }
    },
    {
      $unwind: "$Products"
    },
    {
      $group: {
        _id: { $year: "$date" },
        profit: {
          $sum: { $multiply: [0.5, '$Products.total'] }
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]);
  let  labelsprofit=[2021, 2022, 2023, 2024, 2025, 2026];let profit=[];
  for(let i=0;i<labelsprofit.length;i++)
  {let val=0
    for(let j=0;j<barprofit.length;j++)
    {
        if(labelsprofit[i]==barprofit[j]._id)
        {
            b=true;
            val=barprofit[j].profit;
           break;
            
        }
        
    }
    profit.push(val)
  }

  //payment chart pie chart kind of
  let razor=await order.countDocuments({paymentMode:"razorpay"})||0
  let cod=await order.countDocuments({paymentMode:"cashOnDelivery"})||0
  let wal=await order.countDocuments({paymentMode:"wallet"})||0
  let payment=[wal,cod,razor]

  const razorpayamount = await order.aggregate([
    {
      $match: {
        paymentMode: "razorpay"
      }
    },
    {
      $group: {
        _id: "$paymentMode",
        count: { $sum: 1 },
        totalSum: { $sum: "$total" }
      }
    }
  ]);
  const walletamount = await order.aggregate([
    {
      $match: {
        paymentMode: "wallet"
      }
    },
    {
      $group: {
        _id: "$paymentMode",
        count: { $sum: 1 },
        totalSum: { $sum: "$total" }
      }
    }
  ]);
  const cashOnDeliveryamount = await order.aggregate([
    {
      $match: {
        paymentMode: "cashOnDelivery"
      }
    },
    {
      $group: {
        _id: "$paymentMode",
        count: { $sum: 1 },
        totalSum: { $sum: "$total" }
      }
    }
  ]);
 
  const razoramount=razorpayamount[0].totalSum;const codamount=cashOnDeliveryamount[0].totalSum;const walamount=walletamount[0].totalSum;
  const page = parseInt(req.query.page) || 1;
        const pageSize = 6; 
        const totalorders = await order.countDocuments({"Products.orderStatus": { $nin: ["returned", "cancelled"] }});
       
        const totalPages = Math.ceil(totalorders / pageSize);
  const orders = await order.find({
    "Products.orderStatus": { $nin: ["returned", "cancelled"] }
  })
  .populate({
    path: 'Products.products',
    model: 'Product'
  })
  .populate({
    path: 'user',
    model: 'User'
  }).skip((page - 1) * pageSize)
  .limit(pageSize)
  .exec();
            
          
        const message=req.query.message||'';
        res.render('dashboard',{prodlen,catlen,revenuelen,pendlen,yeardata,yearuser,monthorder,monthuser,profit,totalUsers,saleslen,payment,razoramount,codamount,walamount,orders,page,totalPages})
    }
    catch (error) {
        console.log(error.message);
      }
}


//to view sales report

let invsales=[];let start='';let end=''
const salesreport= async (req, res) => {
  try {
    let startdate=req.query.start||'';
    let enddate=req.query.end||'';
     
      const page = req.query.page || 1;
      const pageSize = 10;
    
      let orders=[]
    
      let ord = await order.find({
        "Products.orderStatus": { $nin: ["returned", "cancelled"] }
      })
          .populate({
              path: 'Products.products', 
              model: 'Product'
          }).populate({
            path: 'user',
            model: 'User'
          }).skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean()
          let totord = await order.find({
            "Products.orderStatus": { $nin: ["returned", "cancelled"] }
          }).populate({
            path: 'Products.products', 
            model: 'Product'
        }).populate({
          path: 'user',
          model: 'User'
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
          function generateOrderId() {
            // Generate a random 5-digit number
            const randomOrderId = Math.floor(10000 + Math.random() * 90000).toString();
            return randomOrderId;
          }
          
          let salesid = generateOrderId();
         
          const invoicePath = generateInvoice(orders,salesid,req.query.start,req.query.end);
          console.log(salesid)
      res.render('salesreport', {  orders, page, totalPages,salesid });
  } catch (error) {
      console.log(error.message);
  }
}

///to get invoice
// invoice 
const getInvoice = (req, res) => {
  try {
      console.log('invoice ')
      const orderId = req.params.id;
      

     const invoicePath = path.join(__dirname, 'invoices', `invoice_${orderId}.pdf`);

      // Set appropriate headers for the PDF download
      res.setHeader('Content-disposition', `attachment; filename=invoice_${orderId}.pdf`);
      res.setHeader('Content-type', 'application/pdf');

      console.log('Invoice Path:', invoicePath);

// Create a readable stream from the invoice file and pipe it to the response
const fileStream = fs.createReadStream(invoicePath);
fileStream.pipe(res);
  } catch (error) {
      console.log(error.message)
  }
}


function generateInvoice(orders, salesid,start,end) {
  const invoicePath = path.join(__dirname, 'invoices', `invoice_${salesid}.pdf`);
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

  // Order details
  doc.fontSize(14).text('Sales Report', { underline: true });
  if (start && end) {
    const startDate = new Date(start).toLocaleDateString('en-GB');
    const endDate = new Date(end).toLocaleDateString('en-GB');
    doc.fontSize(10).text(`Date Range: ${startDate} to ${endDate}`);
    doc.moveDown(); 
  }

  // Display Order ID and Payment Mode
  doc.moveDown(); // Move to the next line
  orders.forEach((order, index) => {
    doc.text(`${index + 1}. Name: ${order.user.Fname}`);
  doc.text(`Name: ${order.user.Fname}`);
  doc.text(`Email: ${order.user.email}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`);
  let matchingAddress = order.user.addressField.find(address => address._id.toString() === order.address.toString());
  let addressString
  if (matchingAddress){
    addressString =  `${matchingAddress.address}, ${matchingAddress.district}, ${matchingAddress.state} ${matchingAddress.pincode}`
   
  }
  doc.text(`Address: ${addressString}`);
  doc.text(`Payment Mode: ${order.paymentMode}`);
  doc.moveDown(); // Move to the next line
})
  doc.end(); // Finalize the PDF

  return invoicePath;
}



//user
const users = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 6; // Number of users per page
        const searchQuery = req.query.search || ''; // Get the search query

        let query = {is_Admin:0};

        // Add search query to the database query if it exists
        if (searchQuery) {
            const regex = new RegExp(`^${searchQuery}`, 'i');
            query.Fname=regex
           
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
    try { 
   
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
       
       const offers=await offer.find({status:true})
        res.render('categoryEdit',{message,editcat,offers})

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
        const offerapplied=await offer.findOne({name:req.body.offers}) ||""
        const offerdiscount=offerapplied.discount||0
      console.log(offerdiscount)
        if (existingCategory && (presentcat.name.toLowerCase() !=  req.body.name.toLowerCase() )) {
          
              
                res.json({success:false,message:'Category name already exists. Please choose another name.',catid:req.query._id})
          
       
        }
        else{
            await Category.updateOne({_id:req.query._id},{$set:{name:req.body.name,description:req.body.description,offer:offerdiscount,offername:req.body.offers}})
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
        const existingcoupon = await coupon.findOne({ couponCode:req.body.couponCode });
        if(!existingcoupon)
        {
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
        }
        else{
            res.json({success:false,message:'Coupon already added'}) 
        }
        
        
                
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

// add offers post
 const addofferspost=async (req, res) => {
    try {
        const existingOffer = await offer.findOne({ name: { $regex: new RegExp(req.body.name, 'i') } });
        if(!existingOffer)
        {
        
        const offerData = new offer({
            name:req.body.name,
        discount:req.body.discount,
        startingDate:req.body.startingDate,
        expiryDate:req.body.expiryDate
          })

          offerData.save()
        
        
    res.json({success:true})   
        } 
        else{
            res.json({success:false,message:'Offer already added'})
          }      
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

//remove offer
const offerremove=async (req, res) => {
    try {
        
        const pro=await offer.deleteOne({name:req.query.name })
    
        
    res.json({success:true})          
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
    salesreport,
    getInvoice,
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
    addofferspost,
    offerremove,
    
    adminlogout
}