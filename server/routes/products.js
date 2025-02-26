const router = require(`express`).Router()
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

const checkAdminAccess = (req, res, next) => {
    if (req.decodedToken.accessLevel >= parseInt(process.env.ACCESS_LEVEL_ADMIN)) {
        next()
    } else {
        res.json({ errorMessage: `User is not an administrator` })
    }
}

// read all records
const getAllProducts = (req, res) => {
    //user does not have to be logged in to see product details
    productsModel.find((error, data) => {
        res.json(data)
    })
}


// Read one record
const getProduct = (req, res) => {
    productsModel.findById(req.params.id, (error, data) => {
        res.json(data)
    })
}

// Add new record
const createProduct = (req, res) => {
    // Use the new product details to create a new product document
    productsModel.create(req.body, (error, data) => {
        res.json(data)
    })
}


// Update one record
const updateProduct = (req, res) => {
    // Use the new product details to update an existing product document
    productsModel.findByIdAndUpdate(req.params.id, { $set: req.body }, (error, data) => {
        res.json(data)
    })
}

// Delete one record
const deleteProduct = (req, res) => {
    productsModel.findByIdAndRemove(req.params.id, (error, data) => {
        res.json(data)
    })
}

router.post(`/products`, verifyUsersJWTPassword, createProduct)
router.get(`/products`, getAllProducts)
router.get(`/products/:id`, verifyUsersJWTPassword, getProduct)
router.put(`/products/:id`, verifyUsersJWTPassword, updateProduct)
router.delete(`/products/:id`, verifyUsersJWTPassword, checkAdminAccess, deleteProduct)

module.exports = router