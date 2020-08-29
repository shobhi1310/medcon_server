const router = require('express').Router();
const bookingModel = require('../models/Booking.model');
const customerModel = require('../models/Customer.model');
const shopModel = require('../models/Shop.model');

router.get('/current/:id', (req, res) => {
  const id = req.params.id;
  bookingModel
    .find({ $or: [{ customer_id: id }, { shop_id: id }], expired: false })
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
          currentBooking.push(bookings[i]);
        }
        //console.log(bookingDate, currentDate, currentDate - bookingDate);
      }

      res.json(currentBooking);
    });
});

router.get('/past/:id', async (req, res) => {
  const id = req.params.id;
  let AllPastBookings = [];
  await bookingModel
    .find({ $or: [{ customer_id: id }, { shop_id: id }], expired: true })
    .then((bookings) => {
      //console.log(bookings);
      AllPastBookings = bookings;
    });

  await bookingModel
    .find({ $or: [{ customer_id: id }, { shop_id: id }], expired: false })
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

  res.json(AllPastBookings);
});

router.post('/book', async (req, res) => {
  //console.log(req.params);
  try {
    let bookingData = new bookingModel({
      customer_id: req.body.customer_id,
      shop_id: req.body.shop_id,
      medicine_id: req.body.medicine_id,
      booking_amount: req.body.booking_amount,
      time_range: req.body.time_range,
      expired: false,
    });
    await bookingData.save();
    res.status(200).json('Booking Successful');
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
