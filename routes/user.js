const router = require('express').Router()
const customerModel = require('../models/Customer.model')
const shopModel = require('../models/Shop.model')

router.route('/login').post(async(req, res)=>{
    const query = {
        email: req.body.email,
        password: req.body.password,
        isCustomer: req.body.isCustomer
    }
    
    var customer = (req.body.isCustomer === 'true')
    
    try {
        // console.log(query);
        let user = {}
        if(customer) {
            user = await customerModel.findOne({email_id: query['email'], password: query['password']})
        } else {
            user = await shopModel.findOne({email_id: query.email, password: query.password})
        }
        // console.log(user);
        res.status(200).json(user)
    } catch (error) {
        res.json(error)
    }
})

router.route('/register').post((req,res)=>{
    let newUser = {}
    var isCustomer = (req.body.isCustomer==='true');
    if(isCustomer) {
        newUser = new customerModel({
            name: req.body.name,
            email_id: req.body.email,
            password: req.body.password,
            phone: req.body.phone
        })
    } else {
        newUser = new shopModel({
            name: req.body.name,
            email_id: req.body.email,
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

router.route('/:id').get(async(req, res) => {
    let user = {}
    try {
        user = await customerModel.findById(req.params.id)
        if(user === null) {
            user = await shopModel.findById(req.params.id)
        }
        let data = [user]
        let dataObj = {data}
        res.json(dataObj)
    } catch(error) {
        res.json(error)
    }
})

router.route('/profile/update/:id').post(async (req,res)=>{

    //right now i am thinking that only user is updating its profile
    //i assuming customer can change its name,password and phone no
    //he/she can't change its email-id
    let user = null;
    var newName
    var newPhone
    var newAddress = null;
    var isCustomer
    try{

        if(req.body.isCustomer === "true"){
            user = await customerModel.findById(req.params.id);
        }else{
            user = await shopModel.findById(req.params.id);
            newAddress = user.address;
        }

        if(user === null || user === undefined){
            res.status(404).json({"Status":"No user exists"});
            return;
        }

        // res.status(200).json(user);

        newName = user.name;
        newPhone = user.phone;
        isCustomer = req.body.isCustomer;

        // console.log("isCustomer ",isCustomer);

        if(req.body.name!==null && req.body.name!==undefined && req.body.name.length>0){
            newName = req.body.name;
        }


        if(req.body.phone!==null && req.body.phone!==undefined && req.body.phone.length>0){
            newPhone = req.body.phone;
        }

        var Query = { _id: req.params.id };
        var updateValue = null;

        if(isCustomer === "true"){
            updateValue={ $set: { name: newName , phone: newPhone} };
            await customerModel.updateOne(Query,updateValue,(err,response)=>{
                if(err){
                    throw err;
                    // return;
                }
            })

            user = await customerModel.findById(req.params.id);
            res.json(user);
    
        }else{
            if(req.body.address!==null && req.body.address!==undefined && req.body.address.length>0){
                newAddress = req.body.address;
            }
            updateValue={ $set: { name: newName , phone: newPhone,address:newAddress} };
            await shopModel.updateOne(Query,updateValue,(err,response)=>{
                if(err){
                    throw err;
                    // return;
                }
            })
    
            user = await shopModel.findById(req.params.id);
            res.json(user);
        }
    }catch(error){
        res.status(404).json({"error":"something went wrong"});
    }
})

router.route('/cart/amount/:id').get(async (req,res)=>{
    const user_id = req.params.id;
    let cart_items;
    try {
        cart_items = await customerModel.findById(user_id,{cart:1}).populate({path:'cart.medicine cart.shop'})
        
        res.json({amount:cart_items.cart.length});
    } catch (error) {
        res.status(400).json(error)
    }
})

router.route('/cart/view/:id').get(async (req,res)=>{
    const user_id = req.params.id;
    let cart_items;
    try {
        cart_items = await customerModel.findById(user_id,{cart:1}).populate({path:'cart.medicine cart.shop'})
        res.json(cart_items);
    } catch (error) {
        res.status(400).json(error)
    }
})

router.route('/cart/add/:id').post( async (req, res) => {
    const user_id = req.params.id;
    const medicineList = req.body.medicineList;
    try {
        let amount=0;
        await customerModel.findById(user_id,((err,customer)=>{
            if(err){
                console.log(err);
            }
            
            let newCart=[...customer.cart];
            newCart=newCart.concat(medicineList);
            //
            customer.cart=newCart;
            amount=newCart.length;
            
            customer.save();
            res.json({amount,})
        }))
        
    } catch (error) {
        res.status(400).json(error)
    }
})

module.exports = router