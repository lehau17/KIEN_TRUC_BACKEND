const express = require('express')
const roomRouter = require('./room.router')

const mainRouter = express.Router()

mainRouter.use("/room", roomRouter)

module.exports = mainRouter
