const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopSchema = new Schema(
  {
    name: { type: String, required: true },
    email_id: { type: String },
    password: { type: String },
    address: { type: String },
    location: [{ type: Schema.Types.Number }, { type: Schema.Types.Number }],
    licence: { type: String },
    phone: { type: String },
    booking_current: [
      {
        type: Schema.Types.ObjectId,
        ref: 'bookings',
      },
    ],
    booking_history: [
      {
        type: Schema.Types.ObjectId,
        ref: 'bookings',
      },
    ],
    medicines: [
      {
        medicine: { type: Schema.Types.ObjectId, ref: 'medicines' },
        status: { type: Boolean },
        wholeSale_price : {type:Schema.Types.Decimal128},
        qty_bought_at: 
          {timestamp:{type:Schema.Types.Date},qty:{type:Schema.Types.Number}}
        ,
        qty_sold_at: 
          {timestamp:{type:Schema.Types.Date},qty:{type:Schema.Types.Number}}
        ,
        mfg_date: {type:Schema.Types.Date},
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Shops = mongoose.model('shops', shopSchema);

module.exports = Shops;
