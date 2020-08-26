const router = require('express').Router()
const customerModel = require('../models/Customer.model')
const shopModel = require('../models/Shop.model')

router.route('/login').post(async(req, res)=>{
    const query = {
        email: req.body.email,
        password: req.body.password,
        isCustomer: req.body.isCustomer
    }

    try {
        if(isCustomer) {
            user = await customerModel.find({email_id: query.email, password: query.password})
        } else {
            user = await shopModel.find({email_id: query.email, password: query.password})
        }
        res.status(200).JSON(user)
    } catch (error) {
        res.JSON(error)
    }
})

router.route('/register').post((req,res)=>{
    let newUser = {}
    if(req.body.isCustomer===true) {
        newUser = new customerModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone
        })
    } else {
        newUser = new shopModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            phone: req.body.phone,
            license: req.body.license
        })
    }

    newUser.save((error, user) => {
        if (error) {
            res.json(error)
        } else {
            res.json(user)
            // res.json("Successfully Registered")
        }
    })
})

module.exports = router