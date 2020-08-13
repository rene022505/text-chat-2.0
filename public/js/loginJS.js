const passwordField = document.querySelector("#password");
const loginButton = document.querySelector("#login");
const registerButton = document.querySelector("#register");
const usernameField = document.querySelector("#username");

const host = "http://localhost:6969";


passwordField.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        loginButton.click();
    }
});

loginButton.addEventListener("click", function () {
    let response = fetch("/login", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameField.value,
            password: passwordField.value
        })
    })
        .then(response => response.text())
        .then(function (response) {
            if (response == 1) {
                alert("Username and password do not match");
            } else {
                sessionStorage.setItem("id", response);
                window.location.href = host + "/chat"; // TODO CHANGE
            }
        })
});

registerButton.addEventListener("click", function () {
    window.location.href = host + "/register";
});