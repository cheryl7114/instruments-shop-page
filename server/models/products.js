const mongoose = require(`mongoose`)

let productsSchema = new mongoose.Schema({
        name: {type: String},
        brand: {type: String},
        colour: {type: String},
        category: {type: String},
        stock: {type: Number},
        price: {type: Number},
        images: {type: [String], default: ["https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg"]},
    },{
        collection: `products`
    })

module.exports = mongoose.model(`products`, productsSchema)