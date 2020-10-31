const router = require('express').Router();
const request = require('request');
const shopModel = require('../models/Shop.model');

router.post('/', async (req, res) => {
    const origin_lat = req.body.latitude;
    const origin_long = req.body.longitude;
    const tags = JSON.parse(req.body.tags);
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
        (err, response, data) => {
          if (err) {
            res.json(err);
          } else {
            const distances = data.resourceSets[0].resources[0].results;
            shops.forEach(
              ({ location, _id, name, address, phone, medicines }, index) => {
                searchedMedicines = []
                tags.map((tag) => {
                    let med = medicines.find((m) => {
                        return m.medicine == tag.id;
                    });
                    if (med != null) {
                        searchedMedicines.push(med);
                    }
                })
                console.log(searchedMedicines);
                if (searchedMedicines.length != 0) {
                    allShops.push({
                        location,
                        _id,
                        name,
                        address,
                        phone,
                        searchedMedicines,
                        travelDistance: distances[index].travelDistance,
                    });
                }
              }
            );
            allShops.sort((shop1, shop2) => {
                if (shop1.searchedMedicines.length === shop2.searchedMedicines.length) {
                    return shop1.travelDistance - shop2.travelDistance;
                }
                return (shop1.searchedMedicines.length < shop2.searchedMedicines.length);
            });
            res.json({ shops: allShops });
          }
        }
    );
    
})

module.exports = router;