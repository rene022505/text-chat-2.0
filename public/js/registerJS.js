document.querySelector("#username").addEventListener("input", function () {
    if (document.querySelector("#username").value.length > 3 && document.querySelector("#username").value.length < 41) {
        let response = fetch("/checkUsername", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.querySelector("#username").value
            })
        })
            .then(data => {
                if (data.status == 200) {
                    document.querySelector("#username").classList.remove("red");
                    document.querySelector("#username").classList.add("green");
                } else {
                    document.querySelector("#username").classList.remove("green");
                    document.querySelector("#username").classList.add("red");
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        document.querySelector("#username").classList.remove("green");
        document.querySelector("#username").classList.add("red");
    }
});

document.querySelector("#password").addEventListener("input", function () {
    if (document.querySelector("#password").value.length < 6 || document.querySelector("#password").value.length > 64) {
        document.querySelector("#password").classList.remove("green");
        document.querySelector("#password").classList.add("red");
        document.querySelector("#confirmPassword").classList.remove("green");
        document.querySelector("#confirmPassword").classList.add("red");
    } else {
        if (document.querySelector("#confirmPassword").value !== document.querySelector("#password").value) {
            document.querySelector("#confirmPassword").classList.remove("green");
            document.querySelector("#confirmPassword").classList.add("red");
        }
        document.querySelector("#password").classList.remove("red");
        document.querySelector("#password").classList.add("green");
    }
});

document.querySelector("#confirmPassword").addEventListener("input", function () {
    if (document.querySelector("#confirmPassword").value !== document.querySelector("#password").value || document.querySelector("#confirmPassword").value === "") {
        document.querySelector("#confirmPassword").classList.remove("green");
        document.querySelector("#confirmPassword").classList.add("red");
    } else {
        document.querySelector("#confirmPassword").classList.remove("red");
        document.querySelector("#confirmPassword").classList.add("green");
    }
});

document.querySelector("#register").addEventListener("click", function () {
    if (document.querySelector("#username").value.length > 3 && document.querySelector("#username").value.length < 41) {
        if (document.querySelector("#password").value.length > 5 && document.querySelector("#password").value.length < 65) {
            if (document.querySelector("#confirmPassword").value === document.querySelector("#password").value) {
                let response = fetch("/register", {
                    method: "post",
                    body: new FormData(document.querySelector("#form"))
                })
                    .then(response => response.text())
                    .then(function (response) {
                        if (response == 1)
                            alert("Username must be between 4 and 40 characters");
                        else if (response == 2)
                            alert("Username already exists");
                        else if (response == 3)
                            alert("Password must be bewteen 6 and 64 characters");
                        else if (response == 4)
                            alert("Passwords don't match");
                        else {
                            sessionStorage.setItem("id", response);
                            window.location.href = "http://localhost:6969/chat"; // TODO CHANGE
                        }
                    });
            } else
                alert("Passwords don't match")
        } else
            alert("Password must be between 6 and 64 characters");
    } else
        alert("Username must be between 4 and 40 characters");
});