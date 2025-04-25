const express = require("express")
const { ketNoiDatabase } = require("./src/config")
const mainRouter = require("./src/router")
const { ZodError } = require("zod")
const { errorMessages, detailedErrorMessages } = require("./src/utils/errorValidateCode")
const limiter = require("./src/middlewares/rate_limiter.middleware")
const timeout = require('connect-timeout');
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// rate limiter
app.use(limiter)    
// time limiter
app.use(timeout('5s', {respond: true}));


app.use((req, res, next) => {
    console.log("Received request:", req.method, req.path);
    next();
});

//5001
// localhost:5001/api

// router
app.use("/api", mainRouter)
//

app.use((err, req, res, next) => {
    console.log("=>>>>>>> Error Middleware:", err);
    // ✅ Xử lý lỗi Zod
    if (err instanceof ZodError) {
        console.log("cjeck error>>>", err)
        let errorObject = {}
        const errorDetails = err.errors.map(e => {
            const field = e.path[0] // Lấy tên trường bị lỗi
            const errorCode = e.message // Mã lỗi từ Zod
            const detailedMessage = detailedErrorMessages[errorCode] || { [field]: errorCode }
            console.log(field, errorCode, detailedMessage)
            errorObject = { ...errorObject, ...detailedMessage }
            return {
                detailedMessage
            }
        });

        return res.status(err.status || 400).json({
            isSuccess: false,
            message: errorObject,
            code: err.code || "ERROR",
        });
    }

    if (err.status && err.message) {
        return res.status(err.status).json({
            isSuccess: false,
            message: err.message,
            code: err.code || "ERROR",
        });
    }

    return res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
    });
});


app.listen(5001, async () => {
    await ketNoiDatabase()
    console.log("App is listening on port ${3000}")
})
