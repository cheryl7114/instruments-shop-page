const express = require(`express`)
const router = express.Router()
const ordersModel = require(`../models/orders`)
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
        const { userId, name, email, deliveryAddress, products, total, paypalPaymentID } = req.body

        if (!name || !email || !deliveryAddress || !products || !total || !paypalPaymentID) {
            return res.json({ errorMessage: `All fields are required` })
        }

        if (!deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.postcode || !deliveryAddress.phone) {
            return res.json({ errorMessage: `Complete delivery address required` })
        }

        const newOrder = new ordersModel({
            ...(userId && { userId }),
            name,
            email,
            deliveryAddress,
            products,
            total,
            paypalPaymentID
        })

        newOrder.save((error, data) => {
            if (error) {
                res.json({ errorMessage: `Error creating order`, error })
            } else {
                res.json(data)
            }
        })
    } catch (error) {
        res.json({ errorMessage: `Error creating order`, error })
    }
}

// get orders for a user
const getOrdersForUser = (req, res) => {
    ordersModel.find({ userId: req.decodedToken.userId })
        .then(data => res.json(data))
        .catch(error => res.json({ errorMessage: `Error getting orders`, error }))
}

const getAllOrders = (req, res) => {
    ordersModel.find({})
        .then(data => res.json(data))
        .catch(error => res.json({ errorMessage: `Error getting all orders`, error }))
}

router.get('/orders', getAllOrders)
router.post('/orders', createNewOrder)
router.get('/orders/user', verifyUsersJWTPassword, getOrdersForUser)

module.exports = router
