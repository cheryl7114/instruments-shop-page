const mongoose = require(`mongoose`)

let productsSchema = new mongoose.Schema({
        name: {type: String},
        brand: {type: String},
        colour: {type: String},
        category: {type: String},
        stock: {type: Number},
        price: {type: Number},
        images: {type: [String], default: ["https://virtualpiano.net/wp-content/uploads/2020/08/Virtual-Guitar-Online-Virtual-Piano.png", "https://instrumentsgallery.in/wp-content/uploads/2023/03/Blue-neon-Lyrical-Front.jpg"]}
    },{
        collection: `products`
    })

module.exports = mongoose.model(`products`, productsSchema)