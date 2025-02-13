const router = require(`express`).Router()
const usersModel = require(`../models/users`)
const bcrypt = require('bcryptjs')


// IMPORTANT
// Obviously, in a production release, you should never have the code below, as it allows a user to delete a database collection
// The code below is for development testing purposes only
router.post(`/users/reset_user_collection`, (req,res) =>
{
    usersModel.deleteMany({}, (error, data) =>
    {
        if(data)
        {
            const adminPassword = `123!"£qweQWE`

            usersModel.create({name:"Administrator",email:"admin@admin.com",password:adminPassword,accessLevel:parseInt(process.env.ACCESS_LEVEL_ADMIN)}, (createError, createData) =>
            {
                if(createData)
                {
                    res.json(createData)
                }
                else
                {
                    res.json({errorMessage:`Failed to create Admin user for testing purposes`})
                }
            })
        }
        else
        {
            res.json({errorMessage:`User is not logged in`})
        }
    })
})

router.post(`/users/register/:name/:email/:password`, (req, res) => {
    // If a user with this email does not already exist, then create new user
    usersModel.findOne({ email: req.params.email }, (uniqueError, uniqueData) => {
        if (uniqueData) {
            res.json({ errorMessage: `User already exists` })
        } else {
            bcrypt.hash(req.params.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUNDS), (err, hash) => {
                if (err) {
                    res.json({ errorMessage: `Error hashing password` })
                } else {
                    usersModel.create({ name: req.params.name, email: req.params.email, password: hash }, (error, data) => {
                        if (data) {
                            res.json({ name: data.name, accessLevel: data.accessLevel })
                        } else {
                            res.json({ errorMessage: `User was not registered` })
                        }
                    })
                }
            })
        }
    })
})


// router.post(`/users/register/:name/:email/:password`, (req, res) =>
// {
//     // If a user with this email does not already exist, then create new user
//     usersModel.findOne({email: req.params.email}, (uniqueError, uniqueData) =>
//     {
//         if (uniqueData)
//         {
//             res.json({errorMessage: `User already exists`})
//         } else
//         {
//             usersModel.create({name: req.params.name, email: req.params.email, password: req.params.password}, (error, data) =>
//             {
//                 if (data)
//                 {
//                     res.json({name: data.name, accessLevel: data.accessLevel})
//                 } else
//                 {
//                     res.json({errorMessage: `User was not registered`})
//                 }
//             })
//         }
//     })
// })


module.exports = router