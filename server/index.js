import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// In case we decide to change port from .env file.
const PORT = process.env.PORT || 8000;
const ADMIN = "Admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();
const appServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

// custom state
const UsersState = {
    users: [],
    setUser: (newUsers) => {
        this.users = newUsers;
    }
}

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

    // Upon connection - emit event only to user
    socket.emit("message", buildMessage(ADMIN, "Welcome to Chat App !"));

    socket.on("enterRoom", ({ name, room }) => {
        const prevRoom = getUser(socket.id)?.room; 

        if (prevRoom) {
            socket.leave(prevRoom);
            io.to(prevRoom).emit("message", buildMessage(ADMIN, `${name} has left the room`));
        }

        const user = activateUser(socket.id, name, room);

        if (prevRoom) {
            io.to(prevRoom).emit("userList", {
                users: getUserInRoom(prevRoom)
            })
        }

        socket.join(user.room);

        // To user who joined
        socket.emit("message", buildMessage(ADMIN, `You have joined the ${user.room} chat room`))

        // To everyone else
        socket.broadcast.to(user.room).emit("message", buildMessage(ADMIN, `${user.name} has joined the room`))

        // Update user list for room
        io.to(user.room).emit("userList", {
            users: getUsersInRoom(user.room) 
        })

        // Update rooms list form everyone
        io.emit("roomList", {
            rooms: getAllActiveRooms()
        })
    })

    // When user disconnects - emit event to all others
    socket.on("disconnect", () => {
        const user = getUser(socket.id); 
        userLeaves(socket.id); 

        if (user) {
            io.to(user.room).emit("message", buildMessage(ADMIN, `${user.name} has left the room`))
             
            io.to(user.room).emit("userList", {
                users: getUsersInRoom(user.room)
            })

            io.emit("roomList", {
                rooms: getAllActiveRooms()
            })
        }   

        console.log(`User ${socket.id} disconnected`)

    })

    // Listening for a message event
    socket.on("message", ({ name, text }) => {
        const room = getUser(socket.id)?.room

        if (room) {
            io.to(room).emit("message", buildMessage(name, text)); 
        }

        io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
    })

    // Listening for activity event
    socket.on("activity", name => {
        const room = getUser(socket.id)?.room
        
        if (room) {
            socket.broadcast.to(room).emit("activity", name);
        }
    })
})

function buildMessage(name, text) {
    return {
        name, 
        text,
        time: new Intl.DateTimeFormat("default", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        }).format(new Date())
    }
}

// User functions
function activateUser(id, name, room) {
    const user = { id, name, room }

    // Make sure we don't have any dublicate users
    UsersState.setUser([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])

    return user;
}


function userLeaves(id) {
    UsersState.setUser([
        ...UsersState.users.filter(user => user.id !== id)
    ])
}


function getUser(id) {
    return UsersState.users.find(user => user.id === id);
}


function getUsersInRoom(room) {
    return UsersState.users.find(user => user.room === room);
}


function getAllActiveRooms() {
     return Array.from(new Set(UsersState.users.map(user => user.room)));
}