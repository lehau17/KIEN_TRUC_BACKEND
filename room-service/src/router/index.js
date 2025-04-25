const express = require('express')
const roomRouter = require('./room.router')
const reviewRouter = require('./review.router')

const mainRouter = express.Router()

mainRouter.use("/room", roomRouter)
mainRouter.use("/review", reviewRouter)


module.exports = mainRouter
