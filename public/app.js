const socket = io("ws://localhost:8000"); 
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
            text: messageInput.value,
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

// Listen for messages
socket.on("message", ({name, text, time}) => {
    activity.textContent = "";
    const li = document.createElement("li");
    li.className = "post";

    if (name === nameInput.value) {
        li.className = "post post--left";
    };

    if (name !== nameInput.value && name !== "Admin") {
        li.className = "post post--right";
    };

    const messageHeader = name === nameInput.value ? "post__header--user" : "post__header--reply";

    // Define message structure based on its type
    if (name !== "Admin") {
        li.innerHTML = `
        <div class="post__header ${messageHeader}">
            <span class="post__header--name">${name}</span>
            <span class="post__header--time">${time}</span>
        </div>

        <div class="post__text"> ${text} </div>
        `
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }

    chatDisplay.appendChild(li)
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
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

socket.on("userList", ({ users }) => {
    showUsers(users);  
})


socket.on("roomList", ({ rooms }) => {
    showRooms(rooms);  
})

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ","
            }
        })
    }
}

function showRooms(rooms) {
    roomList.textContent = ''
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms:</em>'
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ","
            }
        })
    }
}


