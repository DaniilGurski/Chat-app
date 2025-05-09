// import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const socket = io("ws://localhost:8000"); 
const messages = document.querySelector("#messages");
const activity = document.querySelector("#activity")
const messageInput = document.querySelector("#message");

function sendMessage(e) {
    e.preventDefault();
    activity.textContent = "";

    if (messageInput.value) {
        socket.emit("message", messageInput.value);
        messageInput.value = "";
    }

    messageInput.focus();
}


document.querySelector("form").addEventListener("submit", sendMessage)
messageInput.addEventListener("keypress", () => {
    socket.emit("activity", socket.id.substring(0, 5));
})

socket.on("message", (data) => {
    const li = document.createElement("li");
    li.textContent = data; 
    messages.appendChild(li);
});

let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;

    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000);
    clearTimeout(activityTimer, 3000);
})
