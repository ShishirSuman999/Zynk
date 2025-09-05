import { Server } from "socket.io"

let connections = {}    // how many connections are there
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    })

    io.on("connection", (socket) => {
        socket.on("join-call", (path) => {
            if (connections[path] === undefined) connections[path] = []
            connections[path].push(socket.id)
            timeOnline[socket.id] = new Date()
            connections[path].forEach(ele => {
                io.to(ele).emit("user-joined", socket.id)
            })

            if (messages[path] !== undefined) {
                messages[path].forEach(msg => {
                    io.to(socket.id).emit("chat-message", msg['data'],
                        msg['sender'], msg['socket-id-sender'])
                })
            }
        })
        socket.on("signal", (toId, message) => {
            io.on(toId).emit("signal", socket.id, message)
        })
        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                if (!isFound && roomValue.include(socket.id)) return [roomKey, true]
                return [room, isFound]
            }, ['', false])
            if (found === undefined) {
                if (messages[matchingRoom] === undefined) messages[matchingRoom] = []
                messages[matchingRoom].push({ "sender": sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", key, ":", sender, data)
                connections[matchingRoom].forEach(ele => {
                    io.to(ele).emit("chat-message", data, sender, socket.id)
                })
            }
        })
        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            var key
            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; a++) {
                    if (v[a] === socket.id) key = k
                    for (let a = 0; a < connections[key].length; a++) {
                        io.to(connections[key][a]).emit("user-left", socket.id)
                    }
                    var index = connections[key].indexOf(socket.id)
                    connections[key].splice(index, 1)

                    if (connections[key].length === 0) {
                        delete connections[key]
                    }
                }
            }
        })
    })

    return io
}