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

// Below route will group individual medicine bookings
router.get('/current/shop/:id', (req, res) => {
  const id = req.params.id;
  bookingModel
    .find({ shop_id:id, expired: false })
    .populate('shop_id')
    .populate('medicine_id')
    .populate('customer_id')
    .then((bookings) => {
      //console.log(bookings);
      const confirmedBookings = {};
      const waitingBookings={};
      

      for (let i = 0; i < bookings.length; i++) {
        let bookingDate = new Date(bookings[i].createdAt);
        let currentDate = new Date();
        const timeDifference = (currentDate - bookingDate) / 60000;

        if (timeDifference > bookings[i].time_range) {
          bookings[i].expired = true;
          bookings[i].save();
        } else if(bookings[i].bookingCreationTime && bookings[i].status==="confirmed"){
          // If the booking has a bookingCreationTime attribute.
          const singleBookingPrice=parseInt(bookings[i].booking_amount)*bookings[i].medicine_id.price;
          
          if(confirmedBookings[bookings[i].bookingCreationTime]){
            confirmedBookings[bookings[i].bookingCreationTime].items.push(bookings[i]);
            confirmedBookings[bookings[i].bookingCreationTime].totalAmount+=singleBookingPrice;
          }else{
            confirmedBookings[bookings[i].bookingCreationTime]={items:[],totalAmount:0};
            confirmedBookings[bookings[i].bookingCreationTime].items.push(bookings[i]);
            confirmedBookings[bookings[i].bookingCreationTime].totalAmount=singleBookingPrice;
          }
         
        }else if(bookings[i].bookingCreationTime && bookings[i].status==="waiting"){
          // If the booking has a bookingCreationTime attribute.
          const singleBookingPrice=parseInt(bookings[i].booking_amount)*bookings[i].medicine_id.price;
          
          if(waitingBookings[bookings[i].bookingCreationTime]){
            waitingBookings[bookings[i].bookingCreationTime].items.push(bookings[i]);
            waitingBookings[bookings[i].bookingCreationTime].totalAmount+=singleBookingPrice;
          }else{
            waitingBookings[bookings[i].bookingCreationTime]={items:[],totalAmount:0};
            waitingBookings[bookings[i].bookingCreationTime].items.push(bookings[i]);
            waitingBookings[bookings[i].bookingCreationTime].totalAmount=singleBookingPrice;
          }
      }
    }

      let current = {
        confirmedBookings:[],
        waitingBookings:[],
      };
      Object.keys(confirmedBookings).map((key)=>{
        current.confirmedBookings.push(confirmedBookings[key]);
      })
      Object.keys(waitingBookings).map((key)=>{
        current.waitingBookings.push(waitingBookings[key]);
      })
      res.json(current);
    
    });
});


router.post("/confirm",async (req,res)=>{
  /*
      This route will be used for updating status of a booking that is in waiting state.
      Added By Sameed.
  */
  const shop_id=req.body.shop_id;
  const customer_id=req.body.customer_id;
  const bookingCreationTime=req.body.bookingCreationTime;
  try{
  bookingModel.find({shop_id,customer_id,bookingCreationTime,status:"waiting"}).then((bookings)=>{
    for(let i=0;i<bookings.length;i++){
        bookings[i].status="confirmed";
        bookings[i].save();
    }
    res.redirect("/booking/current/shop/"+shop_id);
  })
}
catch(err){
  res.json(err);
}
//res.status(200).json('Updated Status Successfully');

})

router.post("/delivered",async (req,res)=>{
  /*
      This route will be used for updating status of a booking that is in waiting state.
      Added By Sameed.
  */
  const shop_id=req.body.shop_id;
  const customer_id=req.body.customer_id;
  const bookingCreationTime=req.body.bookingCreationTime;
  try{
  bookingModel.find({shop_id,customer_id,bookingCreationTime,status:"confirmed"}).then((bookings)=>{
    for(let i=0;i<bookings.length;i++){
        bookings[i].status="done";
        bookings[i].save();
    }
    res.redirect("/booking/current/shop/"+shop_id);
  })
}
catch(err){
  res.json(err);
}
//res.status(200).json('Updated Status Successfully');

})

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

router.post('/book_all',(req,res)=>{
  let customer_id = req.body.customer_id;
  let collection = req.body.data;
  let time_range = req.body.timeRange;
  let incoming = req.body.uploadedFiles;
  let bookingCreationTime=new Date();
  let deadline = moment().utcOffset('+05:30').add(req.body.timeRange, 'm');
  let arr = [];
  for(let i=0;i<collection.length;i++){
    let prescription_url;
    for(let j=0;j<incoming.length;j++){
      if(incoming[j].med_id===collection[i].medicine._id){
        prescription_url = incoming[j].pr_url;
        break;
      }
    }
    let booking = {
      customer_id,
      shop_id : collection[i].shop._id,
      medicine_id : collection[i].medicine._id,
      time_range,
      expired : false,
      status : "waiting",
      booking_amount : collection[i].quantity,
      prescription_url,
      bookingCreationTime, //Only value that can be used for grouping
      deadline
    }
    arr.push(booking);
  }
  bookingModel.insertMany(arr,(error,doc)=>{
    if(!error){
      res.status(200).json("booking done");
    }else{
      console.log(error);
    }
  })
});

module.exports = router;
