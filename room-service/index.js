const express = require("express")
const { ketNoiDatabase } = require("./src/config")
const mainRouter = require("./src/router")
require('dotenv').config()


const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// router
app.use("/api", mainRouter)
//

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ isSuccess: false, message: err.message || "Internal Server Error" });
});

app.listen(3000,async () => {
    await ketNoiDatabase()
    console.log("App is listening on port ${3000}")
})
