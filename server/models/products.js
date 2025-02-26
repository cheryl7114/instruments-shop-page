const mongoose = require(`mongoose`)

let productImagesSchema = new mongoose.Schema({
        filename:{type:String}
})

let productsSchema = new mongoose.Schema({
        name: {type: String, required:true},
        brand: {type: String, required:true},
        colour: {type: String, required:true},
        category: {type: String, required:true},
        stock: {type: Number, required:true},
        price: {type: Number, required:true},
        images: [productImagesSchema]
    },{
        collection: `products`
    })

module.exports = mongoose.model(`products`, productsSchema)