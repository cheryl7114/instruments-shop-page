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
        const newOrder = new ordersModel({
            ...(req.body.userId && { userId: req.body.userId }),
            email: req.body.email,
            products: req.body.products,
            total: req.body.total,
            paypalPaymentID: req.body.paypalPaymentID
        })
        newOrder.save((error, data) => {
            if (error) {
                res.json({ errorMessage: `Error creating order` })
            } else {
                res.json(data)
            }
        })
    } catch (error) {
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
