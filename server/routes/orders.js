const express = require(`express`)
const router = express.Router()
const ordersModel = require(`../models/orders`)
const productsModel = require(`../models/products`)
const jwt = require('jsonwebtoken')
const fs = require('fs')
const JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8')

const verifyUsersJWTPassword = (req, res, next) => {
    jwt.verify(req.headers.authorization, JWT_PRIVATE_KEY, { algorithm: "HS256" }, (err, decodedToken) => {
        if (err) {
            return res.json({ errorMessage: `User is not logged in` })
        } else {
            req.decodedToken = decodedToken
            next()
        }
    })
}

// create a new order
const createNewOrder = (req, res) => {
    try {
        const newOrder = new ordersModel({
            ...(req.body.userId && { userId: req.body.userId }),
            email: req.body.email,
            products: req.body.products,
            total: req.body.total,
            paypalPaymentID: req.body.paypalPaymentID
        })

        // First save the order
        newOrder.save((error, savedOrder) => {
            if (error) {
                return res.json({ errorMessage: `Error creating order` })
            }

            // After order is saved, update stock for each product
            const stockUpdatePromises = req.body.products.map(product => {
                return new Promise((resolve, reject) => {
                    // Find the product and decrement its stock
                    productsModel.findByIdAndUpdate(
                        product.productID,
                        { $inc: { stock: -product.quantity } }, // Decrease stock by ordered quantity
                        { new: true },
                        (err, updatedProduct) => {
                            if (err) {
                                console.error(`Error updating stock for product ${product.productID}:`, err)
                                reject(err)
                            } else if (!updatedProduct) {
                                console.error(`Product not found: ${product.productID}`)
                                resolve(null)
                            } else {
                                resolve(updatedProduct)
                            }
                        }
                    )
                })
            })

            // Wait for all stock updates to complete
            Promise.all(stockUpdatePromises)
                .then(() => {
                    // All stock updates successful, return the order
                    res.json(savedOrder)
                })
                .catch(updateError => {
                    console.error("Error updating product stocks:", updateError)
                    // We still return the order since it was created
                    // but log the error for investigation
                    res.json(savedOrder)
                })
        })
    } catch (error) {
        console.error("Error in createNewOrder:", error)
        res.json({ errorMessage: `Error creating order` })
    }
}

// get orders for a user
const getOrdersForUser = (req, res) => {
    ordersModel.find({ userId: req.decodedToken.userId }, (error, data) => {
        if (error) {
            res.json({ errorMessage: `Error getting orders` })
        } else {
            res.json(data)
        }
    })
}

router.post('/orders', createNewOrder)
router.get('/orders/user', verifyUsersJWTPassword, getOrdersForUser)

module.exports = router
