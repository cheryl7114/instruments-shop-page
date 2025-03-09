// Server-side global variables
require(`dotenv`).config({path:`./config/.env`})


// Database
require(`./config/db`)


// Express
const createError = require("http-errors")
const express = require(`express`)
const app = express()


app.use(require(`body-parser`).json())
app.use(require(`cors`)({credentials: true, origin: process.env.LOCAL_HOST}))


// Routers
app.use(require(`./routes/products`))
app.use(require(`./routes/users`))
app.use(require(`./routes/orders`))
app.use(require(`./routes/returns`))
app.get("/brands", (req, res) => {
    res.json([])
})


// Port
app.listen(process.env.SERVER_PORT, () =>
{
    console.log(`Connected to port ` + process.env.SERVER_PORT)
})


// Error 404
app.use((req, res, next) => {
    next(createError(404));
})

// Other errors
/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */
/** @typedef {import("express").NextFunction} NextFunction */

/** @type {(err: any, req: Request, res: Response, next: NextFunction) => void} */
const errorHandler = (err, req, res, _next) => {
    const message = err.message || "Unknown error"
    console.error(message)
    res.status(err.statusCode || 500).send(message)
}

app.use(errorHandler)