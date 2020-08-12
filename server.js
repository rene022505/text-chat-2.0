const express = require("express");
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");

const fs = require("fs");

const app = express();
const server = app.listen(6969, startUp);

const io = require("socket.io")(server);

const bcrypt = require("bcrypt");

const { v4: uuidv4, v1: uuidv1 } = require('uuid');


const usernameCheckQuery = "SELECT count(textchat.user.username) as valid FROM textchat.user WHERE textchat.user.username=";

const con = require("./Config/database.js");

function startUp() {
    console.log("Server started at " + server.address().address + ":" + server.address().port);
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

//? Serving folder with css, js and loginpage
app.use(express.static(path.join(__dirname, 'public')));

app.get("/chat", function (req, res) {
    res.sendFile(path.join(__dirname, "public/view/chat.html"));
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/view/login.html"));
});

app.post("/login", function (req, res) {
    const query = "SELECT textchat.user.password as password, textchat.user.iduser as id FROM textchat.user where textchat.user.username= " + mysql.escape(req.body.username);
    con.query(query, function (err, resD) {
        if (err) {
            console.log(err);
            res.sendStatus(404);
            return;
        }
        if (resD[0] == undefined) {
            res.send("1");
            return;
        }
        bcrypt.compare(req.body.password, resD[0].password, function (err, resH) {
            if (err) {
                console.log(err);
                return;
            }
            if (resH) {
                res.send(resD[0].id);
                return;
            } else {
                res.send("1");
                return;
            }
        });
    });
});

app.get("/register", function (req, res) {
    res.sendFile(path.join(__dirname, "public/view/register.html"));
});

app.post("/register", function (req, res) {
    if (req.body.username.length < 4 || req.body.username.length > 40) {
        res.send("1");
        return;
    }

    con.query(usernameCheckQuery + mysql.escape(req.body.username), function (err, resD) {
        if (err) {
            console.log(err);
            res.sendStatus(404);
            return;
        }

        if (resD[0].valid !== 0) {
            res.send("2");
            return;
        }

        if (req.body.password.length < 6 || req.body.password.length > 64) {
            res.send("3");
            return;
        }

        if (req.body.password !== req.body.confirmPassword) {
            res.send("4");
            return;
        }

        let filetype;
        let filename;
        if (!(!req.files || Object.keys(req.files).length === 0)) {
            filetype = req.files.pfp.mimetype;
            if (filetype.substring(0, filetype.lastIndexOf("/")) !== "image")
                filename = "default.png";
            else
                filename = `${uuidv1()}.${filetype.substring(filetype.lastIndexOf("/") + 1)}`;
            req.files.pfp.mv(path.join(__dirname, `profilepictures/${filename}`));
        } else {
            filename = "default.png";
        }

        bcrypt.hash(req.body.password, 10, function (err, hash) {
            if (err) {
                console.log(err);
                res.sendStatus(404);
                return;
            }
            let tempUUID = uuidv4();
            const query = "INSERT INTO textchat.user(iduser, username, password, picture, color) VALUES (" + mysql.escape(tempUUID) + ", " + mysql.escape(req.body.username) + ", " + mysql.escape(hash) +
                ", " + mysql.escape(filename) + ", " + mysql.escape(req.body.color.substring(1)) + ");";
            con.query(query, function (err, resD) {
                if (err) {
                    console.log(err);
                    res.sendStatus(404);
                    return;
                }
                res.send("" + tempUUID);
            });
        });
    });
});

app.post("/checkUsername", function (req, res) {
    con.query(usernameCheckQuery + mysql.escape(req.body.username), function (err, resD) {
        if (err) {
            console.log(err);
            res.sendStatus(404);
            return;
        }
        if (resD[0].valid === 0)
            res.sendStatus(200);
        else
            res.sendStatus(403);
    });
});

io.sockets.on("connection", function (socket) {
    console.log(socket.id + " connected!");

    socket.on("mes", function (data) {
        if (data.message !== "") {
            let messageQuery = "INSERT INTO textchat.message(textchat.message.idsender, textchat.message.messagecontent, textchat.message.time) VALUES (" +
                mysql.escape(data.sender) + ", " + mysql.escape(data.message) + ", " + mysql.escape(new Date()) + ")";
            con.query(messageQuery, function (err, resD) {
                const query = "select textchat.user.username as username, textchat.user.picture as pfp, textchat.user.color as color from textchat.user where textchat.user.iduser=" + mysql.escape(data.sender);
                con.query(query, function (err, resD) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (resD[0] == undefined) {
                        socket.emit("qErr", {
                            errorCode: 2,
                            errorMessage: "User-ID not found"
                        });
                        return;
                    }
                    let name = resD[0].username;
                    fs.readFile("profilepictures\\" + resD[0].pfp, function (err, picData) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        io.sockets.emit("newMes", {
                            sender: name,
                            message: data.message,
                            pfp: `data:image/${resD[0].pfp.substring(resD[0].pfp.lastIndexOf(".") + 1)};base64,` + picData.toString("base64"),
                            color: resD[0].color
                        });
                    });
                });
            });
        }
    });
});