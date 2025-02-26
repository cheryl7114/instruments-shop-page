const router = require(`express`).Router()

const usersModel = require(`../models/users`)

const bcrypt = require('bcryptjs')  // needed for password encryption

const jwt = require('jsonwebtoken')
const fs = require('fs')
const JWT_PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILENAME, 'utf8')

const multer = require('multer')
const upload = multer({ dest: `${process.env.UPLOADED_FILES_FOLDER}` })

const emptyFolder = require('empty-folder')

// verify user's JWT password
const verifyUsersJWTPassword = (req, res, next) => {
    jwt.verify(req.headers.authorization, JWT_PRIVATE_KEY, { algorithm: "HS256" }, (err, decodedToken) => {
        if (err) {
            return res.json({ errorMessage: `User is not logged in` })
        }
        req.decodedToken = decodedToken
        return next()
    })
}

// verify user's login password
const verifyUserPassword = (req, res, next) => {
    bcrypt.compare(req.params.password, req.data.password, (err, result) => {
        if (!result) {
            return res.json({ errorMessage: `Invalid email or password` })
        }
        return next()
    })
}

// reset database
const resetDatabase = (req, res, next) => {
    usersModel.deleteMany({}, (error, data) => {
        if (error || !data) {
            return res.json({ errorMessage: `User is not logged in` })
        }
    })
    return next()
}

// add admin user for testing purposes
const addAdminUser = (req, res) => {
    const adminPassword = `123!"£qweQWE`
    bcrypt.hash(adminPassword, parseInt(process.env.PASSWORD_HASH_SALT_ROUNDS), (err, hash) => {
        usersModel.create({ name: "Administrator", email: "admin@admin.com", password: hash, accessLevel: parseInt(process.env.ACCESS_LEVEL_ADMIN) }, (createError, createData) => {
            if (createData) {
                emptyFolder(process.env.UPLOADED_FILES_FOLDER, false, (result) => {
                    return res.json(createData)
                })
            }
            else {
                return res.json({ errorMessage: `Failed to create Admin user for testing purposes` })
            }
        })
    })
}

// check if file was uploaded
const checkFileUpload = (req, res, next) => {
    if (!req.file) {
        return res.json({ errorMessage: `No file was selected to be uploaded` })
    }
    return next()
}

// check if file is an image
const checkFileIsImage = (req, res, next) => {
    if (req.file.mimetype !== "image/png" && req.file.mimetype !== "image/jpg" && req.file.mimetype !== "image/jpeg") {
        fs.unlink(`${process.env.UPLOADED_FILES_FOLDER}/${req.file.filename}`, (error) => { res.json({ errorMessage: `Only .png, .jpg and .jpeg format accepted` }) })
    }
    return next()
}

// check if user does not already exists
const checkDuplicateUser = (req, res, next) => {
    // If a user with this email does not already exist, then create new user
    usersModel.findOne({ email: req.params.email }, (uniqueError, uniqueData) => {
        if (uniqueData) {
            res.json({ errorMessage: `User already exists` })
        }
    })
}

// add new user
const addNewUser = (req, res) => {
    bcrypt.hash(req.params.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUNDS), (err, hash) => {
        usersModel.create({ name: req.params.name, email: req.params.email, password: hash, profilePhotoFilename: req.file.filename }, (error, data) => {
            if (data) {
                const token = jwt.sign({ email: data.email, accessLevel: data.accessLevel }, JWT_PRIVATE_KEY, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRY })

                fs.readFile(`${process.env.UPLOADED_FILES_FOLDER}/${req.file.filename}`, 'base64', (err, fileData) => {
                    res.json({ userId: data._id, name: data.name, email: data.email, accessLevel: data.accessLevel, profilePhoto: fileData, token: token })
                })
            }
            else {
                res.json({ errorMessage: `User was not registered` })
            }
        })
    })
}

// check that user exists
const checkUserExists = (req, res, next) => {
    usersModel.findOne({ email: req.params.email }, (error, data) => {
        if (!data) {
            return res.json({ errorMessage: `User is not logged in` })
        }
        req.data = data
        return next()
    })
}

// return user details
const returnUserDetails = (req, res) => {
    const token = jwt.sign({ email: req.data.email, accessLevel: req.data.accessLevel }, JWT_PRIVATE_KEY, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRY })

    fs.readFile(`${process.env.UPLOADED_FILES_FOLDER}/${req.data.profilePhotoFilename}`, 'base64', (err, fileData) => {
        if (fileData) {
            res.json({ userId: req.data._id, name: req.data.name, email: req.data.email, accessLevel: req.data.accessLevel, profilePhoto: fileData, token: token })
        }
        else {
            res.json({ userId: req.data._id, name: req.data.name, email: req.data.email, accessLevel: req.data.accessLevel, profilePhoto: null, token: token })
        }
    })
}

// read all users
const readAllUsers = (req, res) => {
    usersModel.find({}, "name email accessLevel", (error, data) => {
        if (error || !data) {
            return res.json({ errorMessage: `Could not retrieve users` })
        }
        res.json(data)
    })
}

// fetch user details by ID
const findUserByID = (req, res) => {
    console.log("Route reached")
    console.log("User ID from URL:", req.params.id)
    usersModel.findById(req.params.id, "name email password accessLevel profilePhotoFilename", (error, data) => {
        if (error) {
            console.error("Error while querying user:", error);
            return res.json({ errorMessage: 'Error querying user' });
        }
        if (!data) {
            console.log('User not found for ID:', req.params.id);
            return res.json({ errorMessage: 'User not found' });
        }
        // if profile photo exists, read it and return it as base64
        if (data.profilePhotoFilename) {
            fs.readFile(`${process.env.UPLOADED_FILES_FOLDER}/${data.profilePhotoFilename}`, "base64", (err, fileData) => {
                if (err) {
                    return res.json({ name: data.name, email: data.email, password: data.password, accessLevel: data.accessLevel, profilePhoto: null })
                }

                res.json({
                    name: data.name, email: data.email, password: data.password, accessLevel: data.accessLevel, profilePhoto: fileData
                })
            })
        } else {
            res.json({ name: data.name, email: data.email, password: data.password, accessLevel: data.accessLevel, profilePhoto: null })
        }
    })
}

const userLogout = (req, res) => {
    res.json({})
}

router.post(`/users/reset_user_collection`, resetDatabase, addAdminUser)
router.post(`/users/register/:name/:email/:password`, upload.single("profilePhoto"), checkFileUpload, checkFileIsImage, checkDuplicateUser, addNewUser)
router.post(`/users/login/:email/:password`, checkUserExists, verifyUserPassword, returnUserDetails)
router.post(`/users/logout`, userLogout)
router.get(`/users`, readAllUsers, verifyUsersJWTPassword)
router.get(`/users/:id`, findUserByID, verifyUsersJWTPassword)

module.exports = router