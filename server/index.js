import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// In case we decide to change port from .env file.
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();
const appServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(path.join(__dirname, "public")))

const io = new Server(appServer, {
    // We need this enabled if we host our frontend elsewhere than on the server.
    // cors: {
    //     // Only allow connections to socket.io from same web source (origin) in production mode.
    //     origin: process.env.NODE_ENV === "production" ? false : ["https://localhost:5501", "http://127.0.0.1:5501"]
    // }
}); 

io.on("connection", socket => {
    console.log(`User ${socket.id} connected`);

    // Upon connection - emit event only to user (to all ?)
    socket.emit("message", "Welcome to Chat app !");

    // Upon connection - emit event to all others
    socket.broadcast.emit("message", `User ${socket.id.substring(0, 5)} connected`);

    // Listening for a message event
    socket.on("message", data => {
        console.log(data);
        io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
    })

    // When user disconnects - emit event to all others
    socket.on("disconnect", () => {
        socket.broadcast.emit("message", `User ${socket.id.substring(0, 5)} disconnected`)
    })

    // Listening for activity event
    socket.on("activity", name => {
        socket.broadcast.emit("activity", name);
    })
})
