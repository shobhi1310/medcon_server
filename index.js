const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');
const flash = require("connect-flash");
var session = require('express-session');

//...




require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = process.env.URI;
// let uri = "mongodb://localhost:27017/medconnect";
// console.log(uri);

// mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;


mongoose.connect(uri,{useNewUrlParser:true})


let gfs;
connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: 'uploads',
  });
  app.locals.gfs = gfs;
});


const medicineRouter = require('./routes/medicine');
const usersRouter = require('./routes/user');
const shopRouter = require('./routes/shop');
const bookingRouter = require('./routes/booking');
const imageRouter = require('./routes/images');
const searchRouter = require('./routes/search')

app.use('/medicine', medicineRouter);
app.use('/user', usersRouter);
app.use('/shop', shopRouter);
app.use('/booking', bookingRouter);
app.use('/images', imageRouter);
app.use('/search', searchRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(process.env.URI);
});



app.get('/', (req, res) => {
  console.log('Hello!!!');
  // console.log(moment().utcOffset('+05:30').add(30, 'm').format('HH:mm'));
  res.json('hello');
});
