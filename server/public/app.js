import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const socket = io("ws://localhost:8000"); 

function sendMessage(e) {
    e.preventDefault();
    const input = e.target.querySelector("#message");

    if (input.value) {
        socket.emit("message", input.value);
        input.values = "";
    }

    input.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage)

socket.on("message", (data) => {
    const li = document.createElement("li");
    li.textContent = data; 
    document.querySelector("#messages").appendChild(li);
});