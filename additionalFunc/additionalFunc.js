const shopModel = require('../models/Shop.model');
const medicineModel = require('../models/Medicine.model');


module.exports =  {
    getMedicine:async (medicineID)=>{
        var medicine = null;
        medicine= await medicineModel.findById(medicineID).then((med)=>{
          // console.log("blah blah: ",med.price);
          return med;
        });
    
        return medicine;
    
        
    },
    getIdx :async (date,referenceDate)=>{
    
        return Math.floor((date-referenceDate)/2629746000);  // 2629746000 milliseconds = 1 month
    },
    getProfit:async (price,qty)=>{
        console.log("peace: ",price);
        console.log("qty: ",qty)
        return price*qty;
    },
    getCheck:async (idx,inHandStocks)=>{
        if(idx-1<0){
            return 0;
        }
        return inHandStocks[idx-1];
    },
    getSafetyStockCheck:async (idx,inHandStock)=>{
        if(idx<0){
            return 0;
        }
        return inHandStock[idx];
    },
    getThreshHold:async (soldStockLength,soldStock)=>{
        if(soldStockLength-1<0){
            return 0;
        }
        return (Math.ceil((0.08)*soldStock[soldStockLength-1]));

    },
    isExpired:async (time)=>{

        // console.log((new Date()).getTime());

        if((((new Date()).getTime()) - time)/2629746000>1){
            // console.log("True");
            return true;
        }
        // console.log("False")
        return false;
    },
    min:async (len1,len2)=>{
        if(len1<=len2){
            return len1;
        }
        return len2;
    },
    abs: async(val1)=>{
        if(val1<=0){
            return -val1;
        }
        return val1;
    }


}