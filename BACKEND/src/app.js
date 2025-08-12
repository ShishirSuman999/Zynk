import express from "express"
import { createServer } from "node:http"

import { Server } from "socket.io"

import mongoose from "mongoose"

import cors from "cors"

const app = express()

app.get("/", (req, res) => {
    return res.json({"hello": "World"})
})

const start = async () => {
    app.listen(3000, () => {
        console.log("Server started on port 3000")
    })
}

start()