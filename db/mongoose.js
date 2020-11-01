const mongoose = require('mongoose')
require('dotenv').config()

// const uri = process.env.URI;
const uri = "mongodb://localhost:27017/medconnect";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true})

const connection = mongoose.connection
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
})

module.exports = connection