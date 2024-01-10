const mongoose = require('mongoose');

const ordersSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentstatus: {
        type: String,
        default:'pending'
       
    },
    Products: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
           
        },
        name: {
            type: String,
           
        },
        price: {
            type: Number,
           
        },
        quantity: {
            type: Number,
           
        },
        total: {
            type: Number,
           
        },
        orderStatus: {
            type: String,
            default: 'placed',
            enum: ['placed', 'shipped', 'delivered', 'request return', 'returned', 'request cancellation', 'cancelled']
        },
        reason:{
            type: String
        }
    }],
    paymentMode: {
        type: String,
       
    },
    total: {
        type: Number
    },
    date: {
        type: Date
    },
    address: {
        type: Object
    },
    
    couponcode: {
        
        type: String,
        default:''
    },
    Totalbefore: {
        
        type: Number,
        default:0
        
    }

});

module.exports = mongoose.model('orders', ordersSchema);