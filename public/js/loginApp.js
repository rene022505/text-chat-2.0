$(document).ready(function () {
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
});