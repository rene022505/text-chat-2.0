const usernameField = document.querySelector("#username");
const passwordField = document.querySelector("#password");
const confirmPasswordField = document.querySelector("#confirmPassword");
const registerButton = document.querySelector("#register");
const loginButton = document.querySelector("#login");

const host = "http://localhost:6969";


function cssClassThing(query, order) {
    if (order) {
        document.querySelector(query).classList.remove("red");
        document.querySelector(query).classList.add("green");
    } else {
        document.querySelector(query).classList.remove("green");
        document.querySelector(query).classList.add("red");
    }
}

usernameField.addEventListener("input", function () {
    if (usernameField.value.length > 3 && usernameField.value.length < 41) {
        let response = fetch("/checkUsername", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameField.value
            })
        })
            .then(data => {
                if (data.status == 200) {
                    cssClassThing("#username", 1);
                } else {
                    cssClassThing("#username", 0);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        cssClassThing("#username", 0);
    }
});

passwordField.addEventListener("input", function () {
    if (passwordField.value.length < 6 || passwordField.value.length > 64) {
        cssClassThing("#password", 0);
    } else {
        if (confirmPasswordField.value !== passwordField.value) {
            cssClassThing("#confirmPassword", 0);
        } else {
            cssClassThing("#confirmPassword", 1);
        }
        cssClassThing("#password", 1);
    }
});

confirmPasswordField.addEventListener("input", function () {
    if (confirmPasswordField.value !== passwordField.value || confirmPasswordField.value === "") {
        cssClassThing("#confirmPassword", 0);
    } else {
        cssClassThing("#confirmPassword", 1);
    }
});

registerButton.addEventListener("click", function () {
    if (usernameField.value.length > 3 && usernameField.value.length < 41) {
        if (passwordField.value.length > 5 && passwordField.value.length < 65) {
            if (confirmPasswordField.value === passwordField.value) {
                let response = fetch("/register", {
                    method: "post",
                    body: new FormData(document.querySelector("#form"))
                })
                    .then(response => {
                        if (response.status == 404) {
                            alert("Something went wrong, please try again!");
                            return;
                        } else {
                            response.text().then(function (response) {
                                if (response == 1)
                                    alert("Username must be between 4 and 40 characters");
                                else if (response == 2)
                                    alert("Username already exists");
                                else if (response == 3)
                                    alert("Password must be bewteen 6 and 64 characters");
                                else if (response == 4)
                                    alert("Passwords don't match");
                                else if (response == 5)
                                    alert("Please select a valid image file with maximum 10mb");
                                else {
                                    sessionStorage.setItem("id", response);
                                    window.location.href = host + "/chat"; // TODO CHANGE
                                }
                            });
                        }
                    })
            } else
                alert("Passwords don't match")
        } else
            alert("Password must be between 6 and 64 characters");
    } else
        alert("Username must be between 4 and 40 characters");
});

loginButton.addEventListener("click", function () {
    window.location.href = host;
});