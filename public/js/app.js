const socket = io.connect('localhost:6969');

$(document).ready(function () {
    // change name to "" and uncomment while loop
    let name = "rene";

    //while (name === "")
    //    name = prompt("Enter your name");

    socket.emit("reg", {
        name: name
    });

    $("#send").on("click", function () {
        if ($("#userInput").val() !== "") {
            socket.emit("mes", {
                sender: name,
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
            let mes = `<div class="message"><div class="name">${data.sender}</div><div class="content">${data.message}</div></div>`;
            $(".chat").append(mes);

            //scrolls to bottom
            let chat = document.getElementsByClassName("chat")[0];
            chat.scrollTop = chat.scrollHeight;
        });
    });
