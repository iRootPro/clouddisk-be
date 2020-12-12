const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth.routes")
const fileRouter = require("./routes/file.routes")
const cors = require("./middlewares/cors")

const app = express()
const PORT = config.get("serverPort")
const dbUrl = config.get("dbUrl")

app.use(express.json())
app.use(express.static('static'))
app.use(fileUpload({}))
app.use(cors)
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)

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


