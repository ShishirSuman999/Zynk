import express, { urlencoded } from "express"
import { createServer } from "node:http"

import { Server } from "socket.io"

import mongoose from "mongoose"
import { connectToSocket } from "./controllers/socketManager.js"

import cors from "cors"

const app = express()
const server = createServer(app)
const io = connectToSocket(server)

app.set("port", (process.env.PORT || 3000))
app.use(cors())
app.use(express.json({limit: "40kb"}))
app.use(urlencoded({limit: "40kb", extended: true}))

const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://shishirnemo1:TPy5gC1FHabwSOrZ@cluster0.ljpy4vr.mongodb.net/")
    console.log(`MONGO connected DB Host: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => {
        console.log("Server started on port 3000")
    })
}

start()