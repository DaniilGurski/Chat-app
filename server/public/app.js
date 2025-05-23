const socket = io("ws://localhost:8000"); 
const messages = document.querySelector("#messages");
const messageInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");
const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

function sendMessage(e) {
    e.preventDefault();
    activity.textContent = "";

    if (nameInput.value && messageInput.value && chatRoom.value) {
        socket.emit("message", {
            name: nameInput.value,
            text: messageInput.input,
        });
        messageInput.value = "";
    }

    messageInput.focus();
}

function enterRoom(e) {
    e.preventDefault();

    if (nameInput.value && chatRoom.value) {
        socket.emit("enterRoom", {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

document.querySelector(".message-form").addEventListener("submit", sendMessage);
document.querySelector(".join-form").addEventListener("submit", enterRoom);

messageInput.addEventListener("keypress", () => {
    socket.emit("activity", nameInput.value);
})

socket.on("message", (data) => {
    const li = document.createElement("li");
    li.textContent = data; 
    messages.appendChild(li);
});

let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;

    // clear previous activity timer 
    clearTimeout(activityTimer);

    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})
