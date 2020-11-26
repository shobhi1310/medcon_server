const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
  name: { type: String },
  image_url: { type: String },
  manufacturer: { type: String },
  strength: { type: String },
  prescription: { type: Boolean },
  category: { type: String },
  sub_category: { type: String },
  price: { type: Number },
  shops: [
    {
      type: Schema.Types.ObjectId,
      ref: 'shops',
    },
  ],
  comments: [
    {
      user:{type: Schema.Types.ObjectId,ref: 'customers'},
      comment:{type:String}
    }
  ],
  expires: {type:Schema.Types.Number}
});

const Medicine = mongoose.model('medicines', medicineSchema);

module.exports = Medicine;
