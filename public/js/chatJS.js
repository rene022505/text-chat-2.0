const socket = io.connect('localhost:6969');
let temp = document.createElement("div");

const sendButton = document.querySelector("#send");
const userInputField = document.querySelector("#userInput");
const logOffButton = document.querySelector(".logoff");
const chatGlobal = document.querySelector(".chat");


sendButton.addEventListener("click", function () {
    if (userInputField.value !== "" && userInputField.value.length < 1000) {
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

    temp.innerHTML = `<div class="message"><div class="image"><img src=${data.pfp} class="pfp"></div><div class=text>${name.outerHTML}${content.outerHTML}</div></div>`;
    chatGlobal.appendChild(temp.firstChild);

    //scrolls to bottom
    const chat = document.getElementsByClassName("chat")[0];
    chat.scrollTop = chat.scrollHeight;
});

socket.on("qErr", function (data) {
    console.log(data);
});

socket.on("identifyS", function() {
    socket.emit("identifyC", {
        id: window.sessionStorage.getItem("id")
    });
});