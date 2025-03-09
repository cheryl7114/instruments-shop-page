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
        const { userId, name, email, deliveryAddress, phoneNumber, products, total, paypalPaymentID } = req.body

        if (!name || !email || !deliveryAddress || !phoneNumber || !products || !total || !paypalPaymentID) {
            return res.json({ errorMessage: `All fields are required` })
        }

        if (!deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.postcode) {
            return res.json({ errorMessage: `Complete delivery address required` })
        }

        const newOrder = new ordersModel({
            ...(userId && { userId }),
            name,
            email,
            deliveryAddress,
            phoneNumber,
            products,
            total,
            paypalPaymentID
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
                    res.json(savedOrder)
                })
        })
    } catch (error) {
        console.error("Error in createNewOrder:", error)
        res.json({ errorMessage: `Error creating order` })
    }
}

const getOrdersForUser = (req, res) => {
    const { userId } = req.body
    if (!userId) {
        return res.json({ errorMessage: "User ID is required" })
    }

    ordersModel.find({ userId: req.body.userId })
        .populate("products.productID", "name")
        .sort({ orderDate: -1 })
        .then(data => res.json(data))
        .catch(error => res.json({ errorMessage: "Error getting orders", error }))
}

const getAllOrders = (req, res) => {
    ordersModel.find({})
        .populate("products.productID", "name")
        .sort({ orderDate: -1 })
        .then(data => res.json(data))
        .catch(error => res.json({ errorMessage: `Error getting all orders`, error }))
}

const getOrderByID = (req, res) => {
    const { orderId } = req.params
    ordersModel.findById(orderId)
        .populate('products.productID', "name")
        .then(order => {
            if (!order) {
                return res.status(404).json({ errorMessage: 'Order not found' })
            }
            res.json(order)
        })
        .catch(error => res.json({ errorMessage: `Error fetching order by ID`, error }))

}

router.get('/orders', verifyUsersJWTPassword, getAllOrders)
router.post('/orders', createNewOrder)
router.post('/orders/history', getOrdersForUser)
router.get('/orders/:orderId', getOrderByID)

module.exports = router
