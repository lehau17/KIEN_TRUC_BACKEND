const express = require("express")
const { ketNoiDatabase } = require("./src/config")
const mainRouter = require("./src/router")
const { ZodError } = require("zod")
require('dotenv').config()


const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// router
app.use("/api", mainRouter)
//

app.use((err, req, res, next) => {
    console.log("=>>>>>>> Error Middleware:", err);
    // ✅ Xử lý lỗi Zod
    if (err instanceof ZodError) {
        // const validationErrors = err.errors.map(e => ({
        //     field: e.path.join("."),
        //     code: e.message,
        //     message: ErrorCodeMap[e.message]?.message || e.message,
        //   }));

        const firstError = err.errors[0];
        return res.status(400).json({
            isSuccess: false,
            message: firstError.message || "Validation error",
            code: firstError.message,
            field: firstError.path.join("."),
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


app.listen(3000, async () => {
    await ketNoiDatabase()
    console.log("App is listening on port ${3000}")
})
