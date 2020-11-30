const router = require('express').Router();
const bookingModel = require('../models/Booking.model');
const customerModel = require('../models/Customer.model');
const shopModel = require('../models/Shop.model');
const moment = require('moment');
const upload = require('../db/upload');
const nodemailer = require("nodemailer");
const { Schema } = require('mongoose');

const testAccount = {
	user: "medconnect36@gmail.com",
	pass: "medconnect123"
}

async function sendMail(data) {
  //console.log(data);
  const bookings=data;
  let totalAmount=0;

  const customer=data[0].customer_id;
  const shop=data[0].shop_id;
  const deadline=data[0].deadline;

  let bookingsData='<tbody>';
  bookings.forEach((item,index)=>{
    const html=`<tr>
    <td style="border:1px solid black; text-align:center">${index+1}</td>
    <td style="border:1px solid black; text-align:center">${item.medicine_id.name}</td>
    <td style="border:1px solid black; text-align:center">${item.booking_amount}</td>
    <td style="border:1px solid black; text-align:center">₹${item.medicine_id.price.toFixed(2)}</td>
    <td style="border:1px solid black; text-align:center">₹${(parseInt(item.booking_amount)*item.medicine_id.price).toFixed(2)}</td>
    </tr>`
    totalAmount+=parseInt(item.booking_amount)*item.medicine_id.price;
    bookingsData+=html;
  
  })
  bookingsData+='</tbody>'
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	// let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: testAccount.user, // generated ethereal user
			pass: testAccount.pass // generated ethereal password
		},

	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"MedConnect" <medconnect36@gmail.com>', // sender address
		to: `<${customer.email_id}>`, // list of receivers
		subject: "Confirmation Mail", // Subject line
		text: `${shop.name} has confirmed your order.`, // plain text body
    html: `
    <h1 style="color:green">${shop.name} has confirmed your order.</h1>
    <h1>Order Summary</h1>

    <table style="width:100%;border:1px solid black;">
    <thead>
    <tr>
    <th style="border:1px solid black;">No.</th>
    <th style="border:1px solid black;">Name</th>
    <th style="border:1px solid black;">Quantity</th>
    <th style="border:1px solid black;">Price</th>
    <th style="border:1px solid black;">Amount</th>
    </tr>
    </thead>
    ${bookingsData}
    </table>

    <h3>Total: ₹${totalAmount.toFixed(2)}</h3>
    <h3>Please collect your medicines before ${deadline} </h3>

    `, // html body
	
  });
}

async function sendRejectMail(data) {
  //console.log(data);
  const bookings=data;
  let totalAmount=0;

  const customer=data[0].customer_id;
  const shop=data[0].shop_id;
  const deadline=data[0].deadline;

  let bookingsData='<tbody>';
  bookings.forEach((item,index)=>{
    const html=`<tr>
    <td style="border:1px solid black; text-align:center">${index+1}</td>
    <td style="border:1px solid black; text-align:center">${item.medicine_id.name}</td>
    <td style="border:1px solid black; text-align:center">${item.booking_amount}</td>
    <td style="border:1px solid black; text-align:center">₹${item.medicine_id.price.toFixed(2)}</td>
    <td style="border:1px solid black; text-align:center">₹${(parseInt(item.booking_amount)*item.medicine_id.price).toFixed(2)}</td>
    </tr>`
    totalAmount+=parseInt(item.booking_amount)*item.medicine_id.price;
    bookingsData+=html;
  
  })
  bookingsData+='</tbody>'
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	// let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: testAccount.user, // generated ethereal user
			pass: testAccount.pass // generated ethereal password
		},

	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"MedConnect" <medconnect36@gmail.com>', // sender address
		to: `<${customer.email_id}>`, // list of receivers
		subject: "Rejection Mail", // Subject line
		text: `${shop.name} has rejected your order.`, // plain text body
    html: `
    <h1 style="color:red">${shop.name} has rejected your order.</h1>
    <h1>Order Summary</h1>

    <table style="width:100%;border:1px solid black;">
    <thead>
    <tr>
    <th style="border:1px solid black;">No.</th>
    <th style="border:1px solid black;">Name</th>
    <th style="border:1px solid black;">Quantity</th>
    <th style="border:1px solid black;">Price</th>
    <th style="border:1px solid black;">Amount</th>
    </tr>
    </thead>
    ${bookingsData}
    </table>

    <h3>Total: ₹${totalAmount.toFixed(2)}</h3>
    <h3>Please call the shop on ${shop.phone} to get the reason for rejection.</h3>

    `, // html body
	
  });
}
  
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
          bookings[i].status="expired";     
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
  bookingModel.find({shop_id,customer_id,bookingCreationTime,status:"waiting"})
  .populate('shop_id')
    .populate('medicine_id')
    .populate('customer_id')
  .then(async (bookings)=>{
    for(let i=0;i<bookings.length;i++){
        bookings[i].status="confirmed";
        bookings[i].save();
    }
    await sendMail(bookings).catch(console.error);
    res.redirect("/booking/current/shop/"+shop_id);
  })
}
catch(err){
  res.json(err);
}
//res.status(200).json('Updated Status Successfully');

})

router.post("/reject",async (req,res)=>{

  /*
      This route will be used for updating status of a booking that is in waiting state.
      Added By Sameed.
  */
  const shop_id=req.body.shop_id;
  const customer_id=req.body.customer_id;
  
  const bookingCreationTime=req.body.bookingCreationTime;

  try{
  bookingModel.find({shop_id,customer_id,bookingCreationTime,status:"waiting"})
  .populate('shop_id')
  .populate('medicine_id')
  .populate('customer_id')
  .then(async (bookings)=>{
    for(let i=0;i<bookings.length;i++){
        bookings[i].status="expired";
        bookings[i].expired=true;
        await bookings[i].save();
    }
    await sendRejectMail(bookings).catch(console.error);
    res.redirect("/booking/current/shop/"+shop_id);
  })
}
catch(err){
  console.log(err);
}
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
  bookingModel.find({shop_id,customer_id,bookingCreationTime,status:"confirmed"}).then(async (bookings)=>{
    for(let i=0;i<bookings.length;i++){
        bookings[i].status="done";
        await bookings[i].save();
        let obj = {
          qty: bookings[i].booking_amount,
          timestamp: new Date()
        }
        await shopModel.update(
          {_id:shop_id,"medicines.medicine":bookings[i].medicine_id},
          {
            $push:{"medicines.$.qty_sold_at":obj},
            $inc: {"medicines.$.available_qty": -bookings[i].booking_amount}
          }
        )
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



//this route is only for testing purposes
router.post('/bookCurrentForTesting/', async (req, res) => {
  try {
    let deadline = await moment().utcOffset('+05:30').add(req.body.time_range, 'm');

    let bookingData = new bookingModel({
      customer_id: req.body.customer_id,
      shop_id: req.body.shop_id,
      medicine_id: req.body.medicine_id,
      booking_amount: req.body.booking_amount,
      time_range: req.body.time_range,
      deadline: deadline.format('HH:mm'),
      expired: false,
      status:req.body.status
      // prescription_url
    });
    let shopID = req.body.shop_id;
    console.log(bookingData);
    //console.log(bookingData);
    await bookingData.save().then(async ()=>{
      await bookingModel
      .find({ $and: [{ customer_id: req.body.customer_id }, { shop_id: req.body.shop_id },{medicine_id:req.body.medicine_id},{expired:false}]}).then(async (bookings)=>{
        console.log("Bookings is: ",bookings);
        res.status(200).json({"res":bookings[0]._id});
        await shopModel.update(
          { _id: shopID },
          { $addToSet: { booking_current: bookings[0]._id } },
          (err, num) => {
            //console.log(err, num);
          }
        );
      })
    })


    // console.log("bug found")
    // let shop = await shopModel.findById(shopID);

    // console.log("Shop is: ",shop)

    

    

   
  } catch (error) {
    res.json({"error":error.message});
  }
});

//this route is only for testing purposes
router.post('/bookHistoryForTesting/', async (req, res) => {

  try {
    let deadline = moment().utcOffset('+05:30').add(req.body.time_range, 'm');

    let bookingData = new bookingModel({
      customer_id: req.body.customer_id,
      shop_id: req.body.shop_id,
      medicine_id: req.body.medicine_id,
      booking_amount: req.body.booking_amount,
      time_range: req.body.time_range,
      deadline: deadline.format('HH:mm'),
      expired: true,
      status:req.body.status
      // prescription_url
    });

    let shopID = req.body.shop_id;
    //console.log(bookingData);
    await bookingData.save();

    let shop = await shopModel.findById(shopID);

    await bookingData.save().then(async ()=>{
      await bookingModel
      .find({ $and: [{ customer_id: req.body.customer_id }, { shop_id: req.body.shop_id },{medicine_id:req.body.medicine_id},{expired:true}]}).then(async (bookings)=>{
        console.log("Bookings is: ",bookings);
        res.status(200).json({"res":bookings[0]._id});
        await shopModel.update(
          { _id: shopID },
          { $addToSet: { booking_history: bookings[0]._id } },
          (err, num) => {
            //console.log(err, num);
          }
        );
      })
    })

    res.status(200).json('Booking Successful');
  } catch (error) {
    res.json({"error":error.message});
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
  bookingModel.insertMany(arr,async (error,doc)=>{
    if(!error){
      let arr = [];
      doc.map(async (d)=>{
        console.log(d._id);
        arr.push(d._id)
        await shopModel.findByIdAndUpdate(d.shop_id,{$push:{booking_current:d._id}})
      })
      console.log(arr);
      const customer=await customerModel.findByIdAndUpdate(customer_id,{$push:{booking_current:arr}},{new:true});
      customer.cart=[];
      customer.cartAmount=0;
      await customer.save();
      res.status(200).json("booking done");
    }else{
      console.log(error);
    }
  })
});

module.exports = router;
