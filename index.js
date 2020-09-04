const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = process.env.URI;

// const uri = "mongodb://localhost:27017/medconnect";

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;

let gfs
connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
  app.locals.gfs = gfs
})

const medicineRouter = require('./routes/medicine');
const usersRouter = require('./routes/user');
const shopRouter = require('./routes/shop');
const bookingRouter = require('./routes/booking');
const imageRouter = require('./routes/images')

app.use('/medicine', medicineRouter);
app.use('/user', usersRouter);
app.use('/shop', shopRouter);
app.use('/booking', bookingRouter);
app.use('/images',imageRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

app.get('/', (req, res) => {
  console.log('Hello!!!');
  res.json('hello');
});
