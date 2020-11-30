const router = require('express').Router();
const mongoose = require('mongoose');
const shopModel = require('../models/Shop.model');
const medicineModel = require('../models/Medicine.model');
const bookingModel  = require('../models/Booking.model')
const additionalFunc = require('../additionalFunc/additionalFunc');
let referenceDate = (new Date(2020,1,1)).getTime();
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

//made route for testing purposes
router.route('/addShops').post(async (req,res)=>{
  
  try {
      console.log(req.body);
      let shopData = {
        name:req.body.name,
        email_id:req.body.email_id,
        password:req.body.password,
        address:req.body.address,
        location:req.body.location,
        license:req.body.license,
        phone:req.body.phone,
      }
      console.log("inside add shop route");
      let newShop =await new shopModel(shopData);

      await newShop.save((err)=>{
        if(err){
          res.json({"error":err});
        }else{
          res.json({"success":"new shop has been added successfully"});
        }
      });



  } catch (error) {
    res.json(error);
  }
});


//made route for testing purposes ,it may happen we need to use this route and make some changes instead of /:ShopID/addMedicine/:MedicineID (POST request)route
router.post('/:ShopID/addMedicineForTesting/:MedicineID', (req, res) => {
  const shopID = req.params.ShopID;
  const medicineID = req.params.MedicineID;
  try {
    var status = req.body.status === 'true';
    var wholesale_price = req.body.wholesale_price;//only here changes are made
    var mfg_date = req.body.mfg_date;// only here changes are made
    var qty_bought_at=req.body.qty_bought_at;
    var qty_sold_at = req.body.qty_sold_at;
    var available_qty = req.body.available_qty

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
        'medicines.medicine': { $ne: mongoose.Types.ObjectId(medicineID) }
      },

      { $addToSet: { medicines: { medicine: medicineID, status ,wholesale_price,mfg_date,qty_bought_at,qty_sold_at,available_qty} } },
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

//made route only for testing purposes
router.post('/showDate', async(req,res)=>{
    //date is returning in format YYYY-MM-DD
    console.log(req.body.manu_date)
    res.json({"date":req.body.manu_date});
});






router.get('/dashboard/:shopID', async (req,res)=>{

    try{
      var shopID = req.params.shopID;
      //first we will calculate profit and loss
  
      let Shop = null;
      let profit = []; //here idx 0 means profit earned by shopOwner from {referenceDate} till just less than 1 month
      let inHandStock= [];//calculate inhandStock and deadStocks
      let deadStock = [78,34,12,78,900,34,78,345,190,245]; //calculate deadstocks 
      let soldStock= [];
      let safetyStock = []; //2-D array of dimension n*3
      let progress = {
        waitingOrders:0,
        deliveredOrders:0,
        expiredOrders:0,
        confirmedOrders:0
      }
  
      let len = 0;
  
      let shop = await shopModel.findById(shopID);


      for(let k = 0;k<shop.medicines.length;k++){
        // console.log(med)
        let med = shop.medicines[k];
        let medicine = await additionalFunc.getMedicine(med.medicine);
        let price = medicine.price;
        let safetyStockInsideArray = [medicine.name];


        console.log("price is: ",price);

        for(let j = 0;j<med.qty_bought_at.length;j++){
          let obj = med.qty_bought_at[j];
          let idx = await additionalFunc.getIdx(obj.timestamp.getTime(),referenceDate);
          // console.log(idx);
          if(idx>=profit.length){
            len = profit.length;
            for(let i = 0;i<=idx-len;i++){
              profit.push(0);
              inHandStock.push(0);
              soldStock.push(0);
            }
          }

          profit[idx]-= await additionalFunc.getProfit(med.wholesale_price,obj.qty);
          inHandStock[idx] += obj.qty + await additionalFunc.getCheck(idx,inHandStock);

          console.log("profit ",profit);
        }

        for(let j = 0;j<med.qty_sold_at.length;j++){
          let obj = med.qty_sold_at[j];
          let idx =  await additionalFunc.getIdx(obj.timestamp.getTime(),referenceDate);
          // console.log(idx);
          if(idx>=profit.length){
            len = profit.length;
            for(let i = 0;i<=idx-len;i++){
              profit.push(0);
              inHandStock.push(inHandStock[inHandStock.length-1]);
              soldStock.push(0);
            }
          }

          profit[idx]+= await additionalFunc.getProfit(med.wholesale_price,obj.qty);
          soldStock[idx]+=obj.qty;
          // inHandStock[idx] -= soldStock[idx];
          // inHandStock[idx]+= await additionalFunc.getCheck(idx,inHandStock);
          console.log("inHandStock: ",inHandStock);
          console.log("Profit inside: ",profit);
          
        }
        for(let j=0;j<additionalFunc.min(soldStock.length,inHandStock.length);j++){
          inHandStock[j]-=soldStock[j];
          inHandStock[j] = additionalFunc.abs(inHandStock[j]);
        }
        safetyStockInsideArray.push(await additionalFunc.getSafetyStockCheck(inHandStock.length-1,inHandStock));
        safetyStockInsideArray.push(await additionalFunc.getThreshHold(soldStock.length-1,soldStock));
        if(safetyStockInsideArray[2]>safetyStockInsideArray[1]){
          safetyStock.push(safetyStockInsideArray);
        }
        
        
    }

  

    console.log(shopID);


    await bookingModel.find({shop_id:shopID,status:"waiting",expired:false}).then(async (bookings)=>{
      console.log(bookings.length);
      progress['waitingOrders']+=bookings.length;
      
    })


    await bookingModel.find({shop_id:shopID,status:"confirmed",expired:false}).then(async (bookings)=>{
      console.log(bookings.length);
      progress['confirmedOrders']+=bookings.length;
    })


    await bookingModel.find({shop_id:shopID,status:"done"}).then(async (bookings)=>{
      console.log(bookings.length);
      progress['deliveredOrders']+=bookings.length;
    })

    await bookingModel.find({shop_id:shopID,expired:true}).then(async (bookings)=>{
      console.log(bookings.length);
      progress['expiredOrders']+=bookings.length;
    })
    


    // console.log("bug found")


    res.json({profit,inHandStock,safetyStock,progress,deadStock});
    }catch(err){
      res.json({"error":err.message})
    }

    

});


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

