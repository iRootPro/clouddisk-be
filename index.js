const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const authRouter = require("./routes/auth.routes")
const cors = require("./middlewares/cors")

const app = express()
const PORT = config.get("serverPort")
const dbUrl = config.get("dbUrl")

app.use(express.json())
app.use(cors)
app.use('/api/auth', authRouter)

const start = async () => {
    try {
        await mongoose.connect(dbUrl)
        app.listen(PORT, () => {
            console.log('Cloud-disk server is started on port', PORT)
        })
    } catch (e) {
        console.error(e)
    }
}

start()


