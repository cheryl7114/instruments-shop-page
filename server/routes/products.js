const router = require(`express`).Router()
const productsModel = require(`../models/products`)
const jwt = require('jsonwebtoken')
const fs = require('fs')
const JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8')

const multer  = require('multer')
let upload = multer({dest: `${process.env.UPLOADED_FILES_FOLDER}`})

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

// get all products 
const getAllProducts = (req, res) => {
    // user does not have to be logged in to see product details
    productsModel.find((error, data) => {
        res.json(data)
    })
}

const getProductImage = (req, res) =>
{
    fs.readFile(`${process.env.UPLOADED_FILES_FOLDER}/${req.params.filename}`, 'base64', (err, fileData) =>
    {
        if(fileData)
        {
            res.json({image:fileData})
        }
        else
        {
            res.json({image:null})
        }
    })
}

// get product by id
const getProduct = (req, res) => {
    productsModel.findById(req.params.id, (error, data) => {
        if (error || !data) {
            return res.json({ errorMessage: `Product not found` })
        }
        res.json(data)
    })
}

// Add new product with multiple file uploads
const createProduct =  (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.json({errorMessage: "No files were selected to be uploaded"})
    }

    let productDetails = {}

    productDetails.name = req.body.name
    productDetails.brand = req.body.brand
    productDetails.colour = req.body.colour
    productDetails.category = req.body.category
    productDetails.stock = req.body.stock
    productDetails.price = req.body.price

    productDetails.images = []
    req.files.map((file, index) => {
        productDetails.images[index] = {filename: `${file.filename}`}
    })

    productsModel.create(productDetails, (error, data) => {
        res.json(data)
    })
}

// Update product
const updateProduct = (req, res) => {
    // Use the new product details to update an existing product document
    productsModel.findByIdAndUpdate(req.params.id, { $set: req.body }, (error, data) => {
        res.json(data)
    })
}           

// delete product
const deleteProduct = (req, res) => {
    productsModel.findByIdAndRemove(req.params.id, (error, data) => {
        res.json(data)
    })
}

// routes are ordered from most specific to least specific (important)
router.post("/products", verifyUsersJWTPassword, checkAdminAccess, upload.array("images", parseInt(process.env.MAX_NUMBER_OF_UPLOAD_FILES_ALLOWED)), createProduct)
router.get(`/products/image/:filename`, getProductImage)
router.get(`/products`, getAllProducts)
router.get(`/products/:id`, verifyUsersJWTPassword, getProduct)
router.put(`/products/:id`, verifyUsersJWTPassword, updateProduct)
router.delete(`/products/:id`, verifyUsersJWTPassword, checkAdminAccess, deleteProduct)

module.exports = router