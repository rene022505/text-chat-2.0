$(document).ready(function () {
    $("#password").on("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            $("#login").click();
        }
    });

    $("#login").on("click", function() {
        $.ajax({
            url: "/login",
            type: "post",
            data: {
                username: $("#username").val(),
                password: $("#password").val()
            }
        })
            .done(function (data) {
                if (data == 1) {
                    alert("Username and password do not match");
                } else {
                    sessionStorage.setItem("id", data);
                    window.location.href = "http://localhost:6969/chat"; // TODO CHANGE
                }
            })
            .fail(function () {
                
            });
    });

    $("#register").on("click", function() {
        window.location.href = "http://localhost:6969/register";
    });
});