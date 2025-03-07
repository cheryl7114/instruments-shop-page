const mongoose = require(`mongoose`)

let ordersSchema = new mongoose.Schema({
        userId: {type: mongoose.Schema.Types.ObjectId, ref: `users`},
        email: {type: String},
        orderDate: {type: Date, default: Date.now},
        products: [{
            productID: {type: mongoose.Schema.Types.ObjectId, ref: `products`},
            quantity: {type: Number},
            price: {type: Number}
        }],
        total: {type: Number}
    },{
        collection: `orders`
    })

module.exports = mongoose.model(`orders`, ordersSchema)