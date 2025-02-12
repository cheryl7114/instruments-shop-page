const router = require(`express`).Router()
const bcrypt = require("bcryptjs");

const usersModel = require(`../models/users.js`)


// IMPORTANT
// Obviously, in a production release, you should never have the code below, as it allows a user to delete a database collection
// The code below is for development testing purposes only 
router.post(`/users/reset_user_collection`, (req, res) => {
    usersModel.deleteMany({}, (error, data) => {
        if (data) {
            res.json(data)
        } else {
            res.json({ errorMessage: `Failed to delete "user" collection for testing purposes` })
        }
    })
})

router.post("users/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword // Store hashed password
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
});


module.exports = router