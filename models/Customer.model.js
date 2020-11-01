const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customerSchema = new Schema({
    name:{type:String},
    email_id:{type:String},
    phone:{type:String},
    password:{type:String},
    booking_current:[{
        type:Schema.Types.ObjectId,
        ref:'bookings'
    }],
    booking_history:[{
        type:Schema.Types.ObjectId,
        ref:'bookings'
    }],
    cart:[{
        medicine:{type:Schema.Types.ObjectId,ref:'medicines'},
        shop:{type:Schema.Types.ObjectId,ref:'shops'},
        quantity:{type:Number}
    }]
},{
    timestamps:true
})

const Customer = mongoose.model('customers',customerSchema)

module.exports = Customer