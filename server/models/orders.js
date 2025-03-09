const mongoose = require(`mongoose`)

let ordersSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: `users`, default: null},
    email: {type: String},
    name: { type: String },
    deliveryAddress: {
        address: { type: String },
        city: { type: String },
        postcode: { type: String },
    },
    phoneNumber: { type: String },
    orderDate: {type: Date, default: Date.now},
        products: [{
            productID: {type: mongoose.Schema.Types.ObjectId, ref: `products`},
            quantity: {type: Number},
            price: {type: Number}
        }],
        total: {type: Number},
        paypalPaymentID: {type: String, required: true},
    },{
        collection: `orders`
    })

module.exports = mongoose.model(`orders`, ordersSchema)