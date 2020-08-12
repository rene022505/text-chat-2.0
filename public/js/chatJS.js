const socket = io.connect('localhost:6969');
let temp = document.createElement("div");

document.querySelector("#send").addEventListener("click", function () {
    if (document.querySelector("#userInput").value !== "") {
        socket.emit("mes", {
            sender: window.sessionStorage.getItem("id"),
            message: document.querySelector("#userInput").value
        });

        document.querySelector("#userInput").value = "";
    }
});

document.querySelector("#userInput").addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.querySelector("#send").click();
    }
});

document.querySelector(".logoff").addEventListener("click", function () {
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
    document.querySelector(".chat").appendChild(temp.firstChild);

    //scrolls to bottom
    const chat = document.getElementsByClassName("chat")[0];
    chat.scrollTop = chat.scrollHeight;
});

socket.on("qErr", function (data) {
    console.log(data);
});
