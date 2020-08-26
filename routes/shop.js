const router = require('express').Router()
const shopModel = require('../models/Shop.model')
const medicineModel = require('../models/Medicine.model')

router.route('/:id').get(async (req,res)=>{
    const id = req.params.id
    let medicines
    try {
        medicines = await medicineModel.findById(id).populate('medicines')
        res.json(medicines)
    } catch (error) {
        res.json(error)
    }
})


module.exports = router