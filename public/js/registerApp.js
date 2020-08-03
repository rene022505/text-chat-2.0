$(document).ready(function () {
    $("#uname").on("input", function () {
        if ($("#uname").val().length > 3) {
            $.ajax({
                url: "/checkUsername",
                type: "post",
                data: {
                    username: $("#uname").val()
                }
            })
                .done(function () { // TODO: change
                    $("#taken").text("Username available!");
                    $("#taken").css("color", "green");
                })
                .fail(function () {
                    $("#taken").text("Username already taken!");
                    $("#taken").css("color", "red");
                });
        } else {
            $("#taken").text("Username must be 4 or more characters!");
            $("#taken").css("color", "red");
        }
    });

    $("#register").on("click", function () {
        $.ajax({
            url: "/register",
            type: "post",
            enctype: 'multipart/form-data',
            processData: false,  // Important!
            contentType: false,
            cache: false,
            data: new FormData($("#form")[0])
        })
            .done(function () {
                // TODO
            })
            .fail(function () {
                // TODO
            });
        ;
    });
});