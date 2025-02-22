const mongoose = require(`mongoose`)

let productsSchema = new mongoose.Schema({
        name: {type: String, required:true},
        brand: {type: String, required:true},
        colour: {type: String, required:true},
        category: {type: String, required:true},
        stock: {type: Number, required:true},
        price: {type: Number, required:true},
        images: {type: [String], default: ["https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg"]},
    },{
        collection: `products`
    })

module.exports = mongoose.model(`products`, productsSchema)