const mongoose = require(`mongoose`)

let productsSchema = new mongoose.Schema({
        name: {type: String},
        brand: {type: String},
        colour: {type: String},
        category: {type: String},
        stock: {type: Number},
        price: {type: Number},
        image: {type: String, default: "https://virtualpiano.net/wp-content/uploads/2020/08/Virtual-Guitar-Online-Virtual-Piano.png"}
    },{
        collection: `products`
    })

module.exports = mongoose.model(`products`, productsSchema)