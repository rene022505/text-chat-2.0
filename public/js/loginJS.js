document.querySelector("#password").addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.querySelector("#login").click();
    }
});

document.querySelector("#login").addEventListener("click", function () {
    let response = fetch("/login", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value
        })
    })
        .then(response => response.text())
        .then(function (response) {
            if (response == 1) {
                alert("Username and password do not match");
            } else {
                sessionStorage.setItem("id", response);
                window.location.href = "http://localhost:6969/chat"; // TODO CHANGE
            }
        })
});

document.querySelector("#register").addEventListener("click", function () {
    window.location.href = "http://localhost:6969/register";
});