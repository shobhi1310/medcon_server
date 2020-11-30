const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: 'customers' },
    shop_id: { type: Schema.Types.ObjectId, ref: 'shops' },
    medicine_id: { type: Schema.Types.ObjectId, ref: 'medicines' },
    prescription_url: { type: String },
    booking_amount: { type: Number },
    time_range: { type: Number },
    expired: { type: Boolean },
    deadline: { type: String },
    status: { type:String },    // waiting, confirmed, delivered, expired
    bookingCreationTime:{type:Date}, // Added by Sameed. Used to group individual bookings.
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;
