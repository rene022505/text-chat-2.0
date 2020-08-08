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
        const mes = `<div class="message"><div class="image"><img src=${data.pfp} class="pfp"></div><div class=text><div class="name" style="color: #${data.color};">${data.sender}</div><div class="content">${data.message}</div></div></div>`;
        $(".chat").append(mes);

        //scrolls to bottom
        const chat = document.getElementsByClassName("chat")[0];
        chat.scrollTop = chat.scrollHeight;
    });

    socket.on("qErr", function(data) {
        console.log(data);
    });
});
