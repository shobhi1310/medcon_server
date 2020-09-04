const router = require('express').Router();
const shopModel = require('../models/Shop.model');

router.get('/city', (req,res)=>{
  shopModel.find({},{location:1}).then((shops)=>{
    const shopList = {shops}
    res.json(shopList)
  })
  .catch(err=>{
    res.json(err);
  })
})

router.route('/:id').get(async (req, res) => {
  const id = req.params.id;
  let shop;
  try {
    shop = await shopModel.findById(id);
    res.json(shop);
  } catch (error) {
    res.json(error);
  }
});

router.route('/medicinelist/:id').get(async (req, res) => {
  const id = req.params.id;
  let shop;
  try {
    shop = await shopModel
      .findById(id, { medicines: 1 })
      .populate('medicines.medicine');
    res.json(shop);
  } catch (error) {
    res.json(error);
  }
});

router.post('/:ShopID/addMedicine/:MedicineID', (req, res) => {
  //console.log('API Called', req.params);
  const shopID = req.params.ShopID;
  const medicineID = req.params.MedicineID;
  try {
    shopModel.findById(shopID).then((Shop) => {
      //console.log(Shop);
    var status = (req.body.status==='true')
      Shop.medicines.push({ medicine: medicineID, status });

      Shop.save();
    });
    res.status(200).json({
      message: 'added',
    });
  } catch (error) {
    res.json(error);
  }
});

router.post('/:ShopID/update/:MedicineID', (req, res) => {
  const shopID = req.params.ShopID;
  const medicineID = req.params.MedicineID;
  try {
    shopModel.findById(shopID).then((Shop) => {
      //console.log(Shop);
      for (let i = 0; i < Shop.medicines.length; i++) {
        //console.log(Shop.medicines[i].medicine, medicineID);
        if (Shop.medicines[i].medicine == medicineID) {
          //console.log('updated');
          Shop.medicines[i].status = !Shop.medicines[i].status;
          break;
        }
      }
      Shop.save();
    });

    res.status(200).json({
      message: 'updated',
    });
  } catch (error) {
    res.json(error);
  }
});

router.delete('/:ShopID/remove/:MedicineID', (req, res) => {
  const shopID = req.params.ShopID;
  const medicineID = req.params.MedicineID;
  try {
    shopModel.findById(shopID).then((Shop) => {
      //console.log(Shop);
      Shop.medicines = Shop.medicines.filter(({ medicine }) => {
        return medicine != medicineID;
      });
      Shop.save();
    });

    res.status(200).json({
      message: 'removed',
    });
  } catch (error) {
    res.json(error);
  }
});

router.post('/location/:id', async(req, res) => {
  let shop;
  try {
    shop = await shopModel.findById(shopID)

    var latitude = req.body.latitude
    var longitude = req.body.longitude
    
    var query = { _id: req.params.id }
    var updateLocation = { $set: { location: [latitude, longitude] } };

    shopModel.updateOne(query, updateLocation, (err, response) => {
      if(err) {
        throw err;
      }

    })

    res.status(200).json("Location Added Successfully")
  } catch (error) {
    res.status(404).json(error)
  }
})

module.exports = router;
