const mongoose = require(`mongoose`)

let usersSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String},
        profilePhotoFilename: {type: String, default: ""},
        deliveryAddress: {
            address: {type: String},
            city: {type: String},
            postcode: {type: String},
        },
        phoneNumber: {type: String, default: ""},
        accessLevel: {type: Number, default:parseInt(process.env.ACCESS_LEVEL_NORMAL_USER)}
    },
    {
        collection: `users`
    })

module.exports = mongoose.model(`users`, usersSchema)