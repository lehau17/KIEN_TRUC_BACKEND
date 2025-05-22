const mongoose =  require("mongoose");
const dotenv = require("dotenv")
dotenv.config()
const MONGO_URI = process.env.MONGO_URI
const ketNoiDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl:false

        });
        console.log("🔥 Connected to MongoDB successfully!");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}


module.exports = ketNoiDatabase



