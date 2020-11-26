const router = require('express').Router();
const bookingModel = require('../models/Booking.model');
const customerModel = require('../models/Customer.model');
const shopModel = require('../models/Shop.model');
const moment = require('moment');
const upload = require('../db/upload');

router.get('/current/:id', (req, res) => {
  const id = req.params.id;
  bookingModel
    .find({ $or: [{ customer_id: id }, { shop_id: id }], expired: false })
    .populate('shop_id')
    .populate('medicine_id')
    .populate('customer_id')
    .then((bookings) => {
      //console.log(bookings);
      const currentBooking = [];

      for (let i = 0; i < bookings.length; i++) {
        let bookingDate = new Date(bookings[i].createdAt);
        let currentDate = new Date();
        const timeDifference = (currentDate - bookingDate) / 60000;

        if (timeDifference > bookings[i].time_range) {
          bookings[i].expired = true;
          bookings[i].save();
        } else {
          // var date =  moment(bookings[i].createdAt).format('Do MMMM, YYYY');
          // var fresh = bookings[i];
          // fresh['date'] = date
          // console.log(fresh);

          currentBooking.push(bookings[i]);
        }
        //console.log(bookingDate, currentDate, currentDate - bookingDate);
      }
      let current = {
        currentBooking,
      };
      res.json(current);
    });
});

router.get('/past/:id', async (req, res) => {
  const id = req.params.id;
  let AllPastBookings = [];
  await bookingModel
    .find({ $or: [{ customer_id: id }, { shop_id: id }], expired: true })
    .populate('shop_id')
    .populate('medicine_id')
    .populate('customer_id')
    .then((bookings) => {
      //console.log(bookings);
      AllPastBookings = bookings;
    });

  await bookingModel
    .find({ $or: [{ customer_id: id }, { shop_id: id }], expired: false })
    .populate('shop_id')
    .populate('medicine_id')
    .then((bookings) => {
      //console.log(bookings);
      const pastBookings = [];

      for (let i = 0; i < bookings.length; i++) {
        let bookingDate = new Date(bookings[i].createdAt);
        let currentDate = new Date();
        const timeDifference = (currentDate - bookingDate) / 60000;

        if (timeDifference > bookings[i].time_range) {
          bookings[i].expired = true;
          bookings[i].save();

          pastBookings.push(bookings[i]);
        }
        //console.log(bookingDate, currentDate, currentDate - bookingDate);
      }
      AllPastBookings = AllPastBookings.concat(pastBookings);
    });
  let past = {
    AllPastBookings,
  };
  res.json(past);
});

router.post('/book', async (req, res) => {
  //console.log(req.params);
  // let prescription_url;
  // if(req.file==''){
  //   prescription_url = ''
  // }else{
  //   prescription_url = `${req.file.filename}`
  // }
  try {
    let deadline = moment().utcOffset('+05:30').add(req.body.time_range, 'm');

    let bookingData = new bookingModel({
      customer_id: req.body.customer_id,
      shop_id: req.body.shop_id,
      medicine_id: req.body.medicine_id,
      booking_amount: req.body.booking_amount,
      time_range: req.body.time_range,
      deadline: deadline.format('HH:mm'),
      expired: false,
      // prescription_url
    });
    //console.log(bookingData);
    await bookingData.save();
    res.status(200).json('Booking Successful');
  } catch (error) {
    res.json(error);
  }
});

router.post('/book_all', async (req,res)=>{
  
});

module.exports = router;
