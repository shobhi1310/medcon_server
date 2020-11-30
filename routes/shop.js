const router = require('express').Router();
const mongoose = require('mongoose');
const shopModel = require('../models/Shop.model');
const medicineModel = require('../models/Medicine.model');
//const Medicine = require('../models/Medicine.model');

router.get('/city', (req, res) => {
  shopModel
    .find({}, {_id:1,name:1,address:1,location: 1 })
    .then((shops) => {
      const shopList = { shops };
      res.json(shopList);
    })
    .catch((err) => {
      res.json(err);
    });
});

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

router.route('/fetch/:text').post(async (req, res) => {
  const query = req.params.text;
  const medicine_id = req.body.med_id;
  let shops;
  try {
    shops = await shopModel
      .find(
        { name: new RegExp('^' + query, 'i'), "medicines.medicine" : medicine_id },
        { _id: 1, name: 1}
      )
      .limit(10);
    res.json(shops)
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
  const shopID = req.params.ShopID;
  const medicineID = req.params.MedicineID;
  try {
    var status = req.body.status === 'true';
    // shopModel.findById(shopID).then((Shop) => {
    //   console.log(Shop);

    //   // Shop.medicines.push({ medicine: medicineID, status });
    //   // Shop.save();
    // });

    let Shop = null;
    shopModel.findById(shopID).then((shop) => {
      Shop = shop;
    });

    shopModel.update(
      {
        _id: shopID,
        'medicines.medicine': { $ne: mongoose.Types.ObjectId(medicineID) },
      },

      { $addToSet: { medicines: { medicine: medicineID, status } } },
      (err, num) => {
        //console.log(err, num);
      }
    );

    if (status) {
      // medicineModel.findById(medicineID).then((Medicine) => {
      //   Medicine.shops.push(shopID);
      //   Medicine.save();
      // });

      medicineModel.update(
        { _id: medicineID },
        { $addToSet: { shops: shopID } },
        (err, num) => {
          //console.log(err, num);
        }
      );
    }
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
          Shop.medicines[i].status = !Shop.medicines[i].status;

          if (Shop.medicines[i].status) {
            //If status is set to true then add to the shops Array of Medicine
            medicineModel.findById(medicineID).then((Medicine) => {
              Medicine.shops.push(shopID);
              Medicine.save();
            });
          } else {
            //If status is set to false then remove the Medicine from shops Array
            //console.log('Deleting...');
            medicineModel.findById(medicineID).then((Medicine) => {
              Medicine.shops = Medicine.shops.filter((id) => id != shopID);
              Medicine.save();
            });
          }

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
  console.log(shopID, medicineID);
  try {
    shopModel
      .findById(shopID)
      .then((Shop) => {
        //console.log(Shop);
        //console.log(shop.medicines);
        Shop.medicines = Shop.medicines.filter(({ medicine }) => {
          return medicine != medicineID;
        });
        //console.log(Shop.medicines);

        Shop.save();
      })
      .catch((err) => {
        console.log(err);
      });

    //If status is set to false then remove the Medicine from shops Array
    //console.log('Deleting...');
    medicineModel.findById(medicineID).then((Medicine) => {
      //console.log(Medicine);
      Medicine.shops = Medicine.shops.filter((id) => id != shopID);
      Medicine.save();
    });

    res.status(200).json({
      message: 'removed',
    });
  } catch (error) {
    res.json(error);
  }
});

router.post('/location/:id', async (req, res) => {
  let shop;
  try {
    shop = await shopModel.findById(req.params.id);

    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var location = [];
    location.push(latitude);
    location.push(longitude);
    var query = { _id: req.params.id };

    shopModel.updateOne(query, { location }, (err, response) => {
      if (err) {
        throw err;
      }
    });

    res.status(200).json('Location Added Successfully');
  } catch (error) {
    res.status(404).json(error);
  }
});


// router.get('/dashboard', async(req,res)=>{
//   // to be done by Chirag
// });

router.route('/inventory/:id').post(async (req, res) => {
  const shopID = req.params.id;
  const med_name = req.body.med_name;
  const qty = parseInt(req.body.qty);
  const mfg_date = new Date(req.body.mfg_date);
  const add_date = new Date(req.body.add_date);
  const wholesale_price = parseFloat(req.body.wholesale_price);
  let shopMedicine = [];
  let response = {};
  console.log(shopID, med_name);
  try {
    const medicine = await medicineModel.find({name: med_name});
    // console.log(medicine, typeof(medicine));
    shopModel
      .findById(shopID, { medicines: 1 })
      .then((shop) => {
        shopMedicine = shop.get('medicines');
        var found = false;
        shopMedicine.map((med, index) => {
          // console.log(med.medicine, typeof(med.medicine), medicine[0]._id, typeof(medicine[0]._id));
          med1 = JSON.stringify(med.medicine);
          med2 = JSON.stringify(medicine[0]._id);
          
          if (med1 == med2) {
            found = true;
            med.qty_bought_at.push({
              timestamp: add_date,
              qty: qty,
              mfg_date: mfg_date
            })
            med.wholesale_price = wholesale_price;
            if (med.available_qty) {
              med.available_qty += qty;
            } else {
              med.available_qty = qty;
            }
            response.medicine = medicine[0];
            response.available_qty = med.available_qty;
            response.wholesale_price = wholesale_price;
          }
          // console.log(med);
        })
        // If not in the medicines array, ie, new medicine
        if (found == false) {
          shopMedicine.push({
            medicine: mongoose.Types.ObjectId(medicine[0]._id),
            status: true,
            wholesale_price: wholesale_price,
            qty_bought_at: [{
              timestamp: add_date,
              qty: qty,
              mfg_date: mfg_date
            }],
            qty_sold_at: [],
            available_qty: qty
          })
        }
        shopModel.updateOne({ _id: shopID }, { $set: { medicines: shopMedicine } }, (err, resp) => {
          if (err) {
            throw(err);
          }
        })
        res.json(response);
      }).catch((err) => {
        res.status(404).json(err);
      })
  } catch (err) {
    console.log(err);
    res.status(404).json(err);
  }
});

module.exports = router;

