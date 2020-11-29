const router = require('express').Router();
const request = require('request');
const medicineModel = require('../models/Medicine.model');

router.route('/tags').get(async (req,res)=>{
  let tags = [];
  try {
    tags = await medicineModel.find({},{_id:1,name:1})
    res.json(tags)
  } catch (error) {
    res.json(error)
  }
})

router.route('/fetch/:text').get(async (req, res) => {
  const query = req.params.text;
  let medicines;
  try {
    medicines = await medicineModel
      .find(
        { name: new RegExp('^' + query, 'i') },
        { _id: 1, name: 1, manufacturer: 1, strength: 1, prescription: 1 }
      )
      .limit(20);
    JSON.stringify(medicines);
    data = {
      medicines: medicines,
    };
    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

router.route('/allopathic/:sub_category').get(async (req, res) => {
  const sub_category = req.params.sub_category;
  try {
    medicines = await medicineModel.find(
      { category: 'allopathic', sub_category },
      {
        _id: 1,
        name: 1,
        manufacturer: 1,
        strength: 1,
        prescription: 1,
        price: 1,
        image_url: 1,
      }
    );
    res.json(medicines);
  } catch (error) {
    res.json(error);
  }
});

router.route('/ayurvedic/:sub_category').get(async (req, res) => {
  const sub_category = req.params.sub_category;
  try {
    medicines = await medicineModel.find(
      { category: 'ayurvedic', sub_category },
      {
        _id: 1,
        name: 1,
        manufacturer: 1,
        strength: 1,
        prescription: 1,
        price: 1,
        image_url: 1,
      }
    );
    res.json({ data: medicines });
  } catch (error) {
    res.json(error);
  }
});


router.route('/dailyUseMedicine').get(async (req,res)=>{

  // console.log("hi")
  // res.json({"status":"hi"})
  //router will fetch 5 allopathic branded and 5 ayurvedic branded medicines
  try{
    let allopathicMedicines = await medicineModel.find(
      {category:"allopathic"},
      {
        _id: 1,
        name: 1,
        manufacturer: 1,
        strength: 1,
        prescription: 1,
        price: 1,
        image_url: 1,
      }
    ).limit(5);

    console.log(allopathicMedicines);

    let ayurvedicMedicines = await medicineModel.find(
      {category:"ayurvedic"},
      {
        _id: 1,
        name: 1,
        manufacturer: 1,
        strength: 1,
        prescription: 1,
        price: 1,
        image_url: 1,
      }
    ).limit(5);
    console.log(ayurvedicMedicines);

    let medicine = [];

    for(let idx = 0;idx<ayurvedicMedicines.length;idx++){
      medicine.push(allopathicMedicines[idx]);
      medicine.push(ayurvedicMedicines[idx]);
    }
  
    res.json({data:medicine});
  }catch(err){
    res.json(err);
  }


  
})

router.route('/:id').get(async (req, res) => {
  const id = req.params.id;
  let medicine;
  try {
    medicine = await medicineModel.findById(id).populate({path:'comments.user', select:'name'});
    res.json(medicine);
  } catch (error) {
    res.json(error);
  }
});

router.route('/shoplist/:id').post(async (req, res) => {
  const id = req.params.id;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  let medicine;
  try {
    medicine = await medicineModel.findById(id).populate('shops');
    let url = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?';
    let key =
      'Au9zVKAUprgIuzokDYXWlvT_4ReDptHhq5U1nK-dpEb5sSyocJV869S5aoplspkI';
    let travelMode = 'walking';
    let origins = latitude + ',' + longitude;
    let destinations = '';

    let allShops = [];

    if (medicine.shops.length === 0) {
      res.json({ shops: allShops });
      return;
    }

    let shopsWithLocation = medicine.shops.filter(({ location }) => {
      return location && location.length !== 0;
    });

    shopsWithLocation.forEach(({ location }) => {
      if (location && location.length !== 0) {
        destinations += location[0] + ',' + location[1] + ';';
      }
    });

    destinations = destinations.substr(0, destinations.length - 1);

    url =
      url +
      '&key=' +
      key +
      '&origins=' +
      origins +
      '&destinations=' +
      destinations +
      '&travelMode=' +
      travelMode;
    //console.log(url);

    request.get(
      { url: url, json: true, headers: { 'User-Agent': 'request' } },
      (err, response, data) => {
        if (err) {
          res.json(err);
        } else {
          //console.log(data.resourceSets[0].resources[0].results);
          const distances = data.resourceSets[0].resources[0].results;
          shopsWithLocation.forEach(
            ({ location, _id, name, address, phone }, index) => {
              allShops.push({
                location,
                _id,
                name,
                address,
                phone,
                travelDistance: distances[index].travelDistance,
              });
            }
          );
          allShops.sort((shop1, shop2) => {
            return shop1.travelDistance > shop2.travelDistance;
          });

          res.json({ shops: allShops });
        }
      }
    );
    //console.log(allShops);
  } catch (error) {
    res.json(error);
  }
});


router.route('/addMedicines').post(async (req,res)=>{
  
  try {
      console.log(req.body);
      let medicineData = {
        name:req.body.name,
        image_url:req.body.image_url,
        manufacturer:req.body.manufacturer,
        strength:req.body.strength,
        prescription:req.body.prescription,
        category:req.body.category,
        sub_category:req.body.sub_category,
        price:req.body.price,
        shops:req.body.shops,
        expires:req.body.expires
      }
      console.log("inside add medicine route");
      let newMedicine =await new medicineModel(medicineData);

      await newMedicine.save((err)=>{
        if(err){
          res.json({"error":err});
        }else{
          res.json({"success":"data has been updated successfully"});
        }
      });



  } catch (error) {
    res.json(error);
  }
});




router.route('/comment/:id').post(async (req,res)=>{
  const id = req.params.id;
  try {
    let comment = {
      user:req.body.user_id,
      comment:req.body.comment
    }
    let result = await medicineModel.findByIdAndUpdate(id,{$push:{comments:comment}},{new:true}).populate({path:'comments.user', select:'name'});
    res.json(result.comments);
  } catch (error) {
    res.json(error)
  }
})


module.exports = router;
