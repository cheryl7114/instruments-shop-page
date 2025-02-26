const router = require(`express`).Router()

const productsModel = require(`../models/products`)

const jwt = require('jsonwebtoken')
const fs = require('fs')
const JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8')

const multer  = require('multer')
var upload = multer({dest: `${process.env.UPLOADED_FILES_FOLDER}`})


// read all records
router.get(`/products`, (req, res) =>
{
    //user does not have to be logged in to see product details
    productsModel.find((error, data) =>
    {
        res.json(data)
    })
})

router.get(`/products/image/:filename`, (req, res) =>
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
})

// Read one record
router.get(`/products/:id`, (req, res) =>
{
    jwt.verify(req.headers.authorization, JWT_PRIVATE_KEY, {algorithm: "HS256"}, (err, decodedToken) =>
    {
        if (err)
        {
            res.json({errorMessage:`User is not logged in`})
        }
        else
        {
            productsModel.findById(req.params.id, (error, data) =>
            {
                res.json(data)
            })
        }
    })
})


// Add new product with multiple file uploads
router.post("/products", upload.array("images", parseInt(process.env.MAX_NUMBER_OF_UPLOAD_FILES_ALLOWED)), (req, res) => {
    jwt.verify(req.headers.authorization, JWT_PRIVATE_KEY, { algorithm: "HS256" }, async (err, decodedToken) => {
        if (err) {
            return res.json({ errorMessage: "User is not logged in" })
        } else {
            if(decodedToken.accessLevel >= process.env.ACCESS_LEVEL_ADMIN) {
                if (!req.files || req.files.length === 0) {
                    return res.json({ errorMessage: "No files were selected to be uploaded" })
                }

                let productDetails = {}

                productDetails.name = req.body.name
                productDetails.brand = req.body.brand
                productDetails.colour = req.body.colour
                productDetails.category = req.body.category
                productDetails.stock = req.body.stock
                productDetails.price = req.body.price

                productDetails.images = []
                req.files.map((file,index) => {
                    productDetails.images[index] = {filename:`${file.filename}`}
                })

                productsModel.create(productDetails, (error, data) => {
                    res.json(data)
                })
            } else {
                res.json({errorMessage:`User is not an administrator, so they cannot add new records`})
            }
        }
    })
})


// Update one record
router.put(`/products/:id`, (req, res) =>
{
    jwt.verify(req.headers.authorization, JWT_PRIVATE_KEY, {algorithm: "HS256"}, (err, decodedToken) =>
    {
        if (err)
        {
            res.json({errorMessage:`User is not logged in`})
        }
        else
        {
            productsModel.findByIdAndUpdate(req.params.id, {$set: req.body}, (error, data) =>
            {
                res.json(data)
            })
        }
    })
})


// Delete one record
router.delete(`/products/:id`, (req, res) =>
{
    jwt.verify(req.headers.authorization, JWT_PRIVATE_KEY, {algorithm: "HS256"}, (err, decodedToken) =>
    {
        if (err)
        {
            res.json({errorMessage:`User is not logged in`})
        }
        else
        {
            if(decodedToken.accessLevel >= process.env.ACCESS_LEVEL_ADMIN)
            {
                productsModel.findByIdAndRemove(req.params.id, (error, data) =>
                {
                    res.json(data)
                })
            }
            else
            {
                res.json({errorMessage:`User is not an administrator, so they cannot delete records`})
            }
        }
    })
})

module.exports = router