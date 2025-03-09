const mongoose = require('mongoose')

let returnsSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    returnDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    refundAmount: { type: Number, required: true },
}, {
    collection: 'returns'
})

module.exports = mongoose.model('returns', returnsSchema)
