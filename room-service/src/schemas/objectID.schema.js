const mongoose = require("mongoose");
const { z } = require("zod");

const ObjectIdSchema = z.custom((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "INVALID_OBJECT_ID"
});


module.exports = { ObjectIdSchema }
