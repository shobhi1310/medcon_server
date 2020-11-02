const router = require('express').Router();
const request = require('request');
const shopModel = require('../models/Shop.model');
const medicineModel = require('../models/Medicine.model');

router.post('/', async (req, res) => {
    console.log(req.body);
    const origin_lat = req.body.latitude;
    const origin_long = req.body.longitude;
    const tags = req.body.tags;
    const travelMode = req.body.travelMode;
    const shops = await shopModel.find();
    const base_url = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?";
    const key = "Au9zVKAUprgIuzokDYXWlvT_4ReDptHhq5U1nK-dpEb5sSyocJV869S5aoplspkI";
    const origin = origin_lat + "," + origin_long;
    
    let destinations = "";
    shops.map((shop) => {
        destinations += (shop.location[0] + "," + shop.location[1] + ";");
    })
    destinations = destinations.substr(0, destinations.length - 1);
    
    let url = base_url + "&key=" + key + "&origins=" + origin +"&destinations="+ destinations + "&travelMode=" + travelMode;
    console.log(url);
    let allShops = [];
    request.get(
        { url: url, json: true, headers: { 'User-Agent': 'request' } },
        async (err, response, data) => {
          if (err) {
            res.json(err);
          } else {
            const distances = data.resourceSets[0].resources[0].results;
            // console.log(shops);

            for(let index=0;index<shops.length;index++){

              let { location, _id, name, address, phone, medicines }=shops[index];

              console.log(index,shops.length)
                searchedMedicines = [];
                for (let i = 0; i < tags.length; i++) {
                  tag = tags[i];
                  let med = medicines.find((m) => {
                    return m.medicine == tag._id;
                  });
                  if (med != null) {
                    searchedMedicines.push(med);
                  }
                }
                

                let populatedMedicines = [];
                let promises = [];
                for (i = 0; i < searchedMedicines.length; i++) {
                  promises.push(
                    medicineModel.findById(searchedMedicines[i].medicine, (err, response) => {
                      populatedMedicines.push(response);
                    })
                  );
                }

                await Promise.all(promises).then(() => console.log("Populated", _id, populatedMedicines));

                if (populatedMedicines.length != 0) {
                  allShops.push({
                    location,
                    _id,
                    name,
                    address,
                    phone,
                    searchedMedicines: populatedMedicines,
                    travelDistance: distances[index].travelDistance,
                  });
                  console.log("PUSHED",allShops);
                  
                }
            }
            //  shops.forEach(
            //   async ( index) => {
                
                
            //   }
            // );
            
            
            console.log("HERE");
            allShops.sort((shop1, shop2) => {
            if (shop1.searchedMedicines.length === shop2.searchedMedicines.length) {
                return shop1.travelDistance - shop2.travelDistance;
            }
            return (shop1.searchedMedicines.length < shop2.searchedMedicines.length);
            });
            console.log("ALL",allShops)
            res.json({ shops: allShops });
          }
        }
    );
})

module.exports = router;