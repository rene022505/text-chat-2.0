const socket = io.connect('localhost:6969');

$(document).ready(function () {
    $("#send").on("click", function () {
        if ($("#userInput").val() !== "") {
            socket.emit("mes", {
                sender: window.sessionStorage.getItem("id"),
                message: $("#userInput").val()
            });

            $("#userInput").val("");
        }
    });

    document.getElementById("userInput").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            $("#send").click();
        }
    });

    socket.on("newMes", function (data) {
        let name = document.createElement("div");
        name.style.color = `#${data.color}`;
        name.textContent = data.sender;

        let content = document.createElement("div");
        content.classList.add("content");
        content.textContent = data.message;

        const mes = `<div class="message"><div class="image"><img src=${data.pfp} class="pfp"></div><div class=text>${name.outerHTML}${content.outerHTML}</div></div>`;
        
        $(".chat").append(mes);

        //scrolls to bottom
        const chat = document.getElementsByClassName("chat")[0];
        chat.scrollTop = chat.scrollHeight;
    });

    socket.on("qErr", function(data) {
        console.log(data);
    });
});
