$(document).ready(function () {
    $("#username").on("input", function () {
        if ($("#username").val().length > 3 && $("#username").val().length < 41) {
            $.ajax({
                url: "/checkUsername",
                type: "post",
                data: {
                    username: $("#username").val()
                }
            })
                .done(function () {
                    $("#username").removeClass("red");
                    $("#username").addClass("green");
                })
                .fail(function () {
                    $("#username").removeClass("green");
                    $("#username").addClass("red");
                });
        } else {
            $("#username").removeClass("green");
            $("#username").addClass("red");
        }
    });

    $("#password").on("input", function () {
        if ($("#password").val().length < 6 || $("#password").val().length > 64) {
            $("#password").removeClass("green");
            $("#password").addClass("red");
            $("#confirmPassword").removeClass("green");
            $("#confirmPassword").addClass("red");
        } else {
            if ($("#confirmPassword").val() !== $("#password").val()) {
                $("#confirmPassword").removeClass("green");
                $("#confirmPassword").addClass("red");
            }
            $("#password").removeClass("red");
            $("#password").addClass("green");
        }
    });

    $("#confirmPassword").on("input", function () {
        if ($("#confirmPassword").val() !== $("#password").val() || $("#confirmPassword").val() === "") {
            $("#confirmPassword").removeClass("green");
            $("#confirmPassword").addClass("red");
        } else {
            $("#confirmPassword").removeClass("red");
            $("#confirmPassword").addClass("green");
        }
    });

    $("#register").on("click", function () {
        if ($("#username").val().length > 3 && $("#username").val().length < 41) {
            if ($("#password").val().length > 5 && $("#password").val().length < 65) {
                if ($("#confirmPassword").val() === $("#password").val()) {
                    $.ajax({
                        url: "/register",
                        type: "post",
                        enctype: 'multipart/form-data',
                        processData: false,  // Important!
                        contentType: false,
                        cache: false,
                        data: new FormData($("#form")[0])
                    })
                        .done(function (data) {
                            if (data == 1)
                                alert("Username must be between 4 and 40 characters");
                            else if (data == 2)
                                alert("Username already exists");
                            else if (data == 3)
                                alert("Password must be bewteen 6 and 64 characters");
                            else if (data == 4)
                                alert("Passwords don't match");
                            else {
                                sessionStorage.setItem("id", data);
                                window.location.href = "http://localhost:6969/chat"; // TODO CHANGE
                            }
                        })
                        .fail(function () {
                            // TODO
                        });
                } else
                    alert("Passwords don't match")
            } else
                alert("Password must be between 6 and 64 characters");
        } else
            alert("Username must be between 4 and 40 characters");
    });
});