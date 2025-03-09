const express = require('express')
const router = express.Router()
const returnsModel = require('../models/returns')
const ordersModel = require('../models/orders')
const productsModel = require('../models/products')

const getReturnsForUser = (req, res) => {
    const { userId } = req.body
    if (!userId) {
        return res.json({ errorMessage: "User ID is required" })
    }

    // Find returns by userId
    returnsModel.find({ userId: userId })
        .populate("productId", "name")
        .sort({ createdAt: -1 })
        .then(data => {
            res.json(data)
        })
        .catch(error => {
            console.error(error)
            res.json({ errorMessage: "Error getting returns", error })
        })
}

const createReturnRequest = (req, res) => {
    const { orderId, userId, productId, quantity, reason, refundAmount } = req.body

    // Validate request fields
    if (!orderId || !userId || !productId || !quantity || !reason || !refundAmount) {
        return res.status(400).json({ errorMessage: 'All fields are required' })
    }

    // Find order by orderId
    ordersModel.findById(orderId).then(order => {
        if (!order) {
            return res.status(404).json({ errorMessage: 'Order not found' })
        }

        // Check if the product was part of the order
        const orderedProduct = order.products.find(p => p.productID.toString() === productId)
        if (!orderedProduct) {
            return res.status(400).json({ errorMessage: 'Product not found in this order' })
        }

        // Return quantity cannot exceed the purchased quantity
        if (quantity > orderedProduct.quantity) {
            return res.status(400).json({ errorMessage: 'Return quantity exceeds purchased quantity' })
        }

        // Check if the product exists in the database
        productsModel.findById(productId).then(product => {
            if (!product) {
                return res.status(404).json({ errorMessage: 'Product does not exist' })
            }

            const newReturn = new returnsModel({
                orderId,
                userId,
                productId,
                quantity,
                reason,
                refundAmount
            })

            // Save return request to database
            newReturn.save()
                .then(() => res.json({ successMessage: 'Return request submitted successfully' }))
                .catch(err => {
                    console.error(err)
                    res.status(500).json({ errorMessage: 'Error saving return request' })
                })
        }).catch(err => {
            console.error(err)
            res.json({ errorMessage: 'Error retrieving product details' })
        })
    }).catch(err => {
        console.error(err)
        res.json({ errorMessage: 'Error retrieving order details' })
    })
}

module.exports = router
router.post('/returns', createReturnRequest)
router.post('/returns/history', getReturnsForUser)
