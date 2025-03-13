const mongoose = require(`mongoose`)

let ordersSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: `users`, default: null},
    email: {type: String, required: true},
    name: { type: String, required: true},
    deliveryAddress: {
        address: { type: String,required: true},
        city: { type: String, required: true},
        postcode: { type: String, required: true },
    },
    phoneNumber: { type: String, required: true },
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