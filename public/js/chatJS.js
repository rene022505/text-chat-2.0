const socket = io.connect('localhost:6969');
let temp = document.createElement("div");

const sendButton = document.querySelector("#send");
const userInputField = document.querySelector("#userInput");
const logOffButton = document.querySelector(".logoff");
const chatGlobal = document.querySelector(".chat");
const charCount = document.querySelector(".count");
let chatScroll = document.getElementsByClassName("chat")[0];



sendButton.addEventListener("click", function () {
    if (userInputField.value !== "" && userInputField.value.length <= 1000) {
        socket.emit("mes", {
            sender: window.sessionStorage.getItem("id"),
            message: userInputField.value
        });

        userInputField.value = "";
    }
});

userInputField.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        sendButton.click();
        return;
    }

    if (1000 - userInputField.value.length <= 100) {
        charCount.textContent = 1000 - userInputField.value.length;
    } else {
        charCount.textContent = "";
    }
});

logOffButton.addEventListener("click", function () {
    window.sessionStorage.removeItem("id");
    window.location.href = "http://localhost:6969/";
});

socket.on("newMes", function (data) {
    let name = document.createElement("div");
    name.style.color = `#${data.color}`;
    name.textContent = data.sender;

    let content = document.createElement("div");
    content.classList.add("content");
    content.textContent = data.message;

    let time = document.createElement("div");
    time.classList.add("time");
    time.textContent = data.time;

    temp.innerHTML = `<div class="message"><div class="image"><img src="${data.pfp}" class="pfp"></div><div class=text><div class="messageHeader">${name.outerHTML}${time.outerHTML}</div>${content.outerHTML}</div></div>`;
    if (data.append)
        chatGlobal.appendChild(temp.firstChild);
    else
        chatGlobal.prepend(temp.firstChild);

    //scrolls to bottom
    if (data.scrollDown)
        chatScroll.scrollTop = chatScroll.scrollHeight;
});

let isScrolling;

chatGlobal.addEventListener("scroll", function () {
    window.clearTimeout(isScrolling);

    isScrolling = setTimeout(function () {
        if (chatScroll.scrollTop < 600) {
            socket.emit("moreMessages", {
                id: window.sessionStorage.getItem("oldestMessage") // beatiful
            });
        }
    }, 66);
});

socket.on("qErr", function (data) {
    console.log(data);
});

socket.on("identifyS", function () {
    socket.emit("identifyC", {
        id: window.sessionStorage.getItem("id")
    });
});

socket.on("oldestMessage", function(data) {
    window.sessionStorage.setItem("oldestMessage", data.id);
});

socket.on("newestMessage", function(data) {
    window.sessionStorage.setItem("newestMessage", data.id);
});