const connection = require('../db/mongoose')
const router = require('express').Router()
const mongoose = require('mongoose')
const upload = require('../db/upload')
const path = require('path')

let gfs
connection.once('open', ()=>{
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})

router.post('/upload', upload.single('prsc'), (req, res) => {
  let prsc_url;
  console.log(req.file);
  if(req.file == undefined){
    prsc_url = ""
  }else{
    prsc_url = `${req.file.filename}`
    // res.json(prsc_url)
  }
  res.status(200).json(prsc_url);
})

router.post('/delete', async (req,res)=>{
  let file_id;
  // console.log(req.body);
  try {
    let file = await gfs.find({filename:req.body.filename}).toArray()
    file_id = file[0]._id
    await gfs.delete(new mongoose.Types.ObjectId(file_id))
    res.status(200).json("File deleted")
  } catch (error) {
    res.json(error)
  }
})

router.get('/:filename', (req, res) => {
  gfs.find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'no files exist'
        })
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    })
})

module.exports = router