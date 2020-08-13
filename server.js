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

app.get("/pfp/*", function (req, res) {
    res.sendFile(path.join(__dirname, "profilepictures/" + req.path.substr(5)));
});

app.get("/register", function (req, res) {
    res.sendFile(path.join(__dirname, "public/view/register.html"));
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
            res.send("2"); // name already used
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
        if (!(!req.files || Object.keys(req.files).length === 0)) { // if file is provided else use default
            filetype = req.files.pfp.mimetype;
            if (filetype.substring(0, filetype.lastIndexOf("/")) !== "image") {
                res.send("5"); // file is not image
                return;
            } else {
                filename = `${uuidv1()}.${filetype.substring(filetype.lastIndexOf("/") + 1)}`;
                req.files.pfp.mv(path.join(__dirname, `profilepictures/${filename}`));
            }
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

function emitNewMessage(socket, _username, _message, _pfp, _color, _time, _scrollDown, _append) {
    socket.emit("newMes", {
        sender: _username,
        message: _message,
        pfp: "/pfp/" + _pfp,
        color: _color,
        time: _time,
        scrollDown: _scrollDown,
        append: _append
    });
}

io.sockets.on("connection", function (socket) {
    console.log(socket.id + " connected!");
    socket.emit("identifyS");

    const query = "select textchat.message.idsender as sender, textchat.message.messagecontent as content, textchat.message.time as time, textchat.message.idmessage as id from textchat.message order by textchat.message.idmessage desc limit 50"; // get last 50 messages on connecting
    con.query(query, function (err, resDin) {
        if (err) {
            console.log(err);
            return;
        }

        let query;

        socket.emit("newestMessage", {
            id: resDin[0].id
        });

        for (let i = 0; i < 50; i++) {
            if (resDin[i] == undefined) {
                break;
            }

            query = "select textchat.user.username as username, textchat.user.picture as pfp, textchat.user.color as color from textchat.user where textchat.user.iduser=" + mysql.escape(resDin[i].sender);
            con.query(query, function (err, resD) {
                if (err) {
                    console.log(err);
                    return;
                }

                emitNewMessage(socket, resD[0].username, resDin[i].content, resD[0].pfp, resD[0].color, resDin[i].time, true, true);
            });
        }

        socket.emit("oldestMessage", {
            id: resDin.reverse()[0].id
        });

    });

    socket.on("identifyC", function (data) {
        const query = "select textchat.user.username as username from textchat.user where textchat.user.iduser=" + mysql.escape(data.id);
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
            console.log(resD[0].username + " connected!");
        })
    });

    socket.on("mes", function (data) {
        if (data.message !== "" || data.message.length <= 1000) {

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

                const _time = new Date().toISOString().slice(0, 19).replace('T', ' ');

                socket.broadcast.emit("newMes", { // send to all others (without scrolling down)
                    sender: resD[0].username,
                    message: data.message,
                    pfp: "/pfp/" + resD[0].pfp,
                    color: resD[0].color,
                    time: _time,
                    scrollDown: false,
                    append: true
                });

                emitNewMessage(socket, resD[0].username, data.message, resD[0].pfp, resD[0].color, _time,true, true); // send to self (with scrolling down)
            });

            let messageQuery = "INSERT INTO textchat.message(textchat.message.idsender, textchat.message.messagecontent, textchat.message.time) VALUES (" +
                mysql.escape(data.sender) + ", " + mysql.escape(data.message) + ", " + mysql.escape(new Date().toISOString().slice(0, 19).replace('T', ' ')) + ")";
            con.query(messageQuery, function (err, resD) {
                if (err) {
                    console.log(err);
                    return;
                }
                con.query("SELECT textchat.message.idmessage as id from textchat.message order by textchat.message.idmessage desc limit 1", function(err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    io.emit("newestMessage", {
                        id: res[0].id
                    });
                })
            });
        }
    });

    socket.on("moreMessages", function (data) {
        const query = "select textchat.message.idsender as sender, textchat.message.messagecontent as content, textchat.message.time as time, textchat.message.idmessage as id from textchat.message where textchat.message.idmessage < " +
            mysql.escape(data.id) + " order by textchat.message.idmessage desc limit 50";

        con.query(query, function (err, resDin) {
            if (err) {
                console.log(err);
                return;
            }

            socket.emit("oldestMessage", {
                id: resDin.reverse()[0].id
            });

            const message = resDin.reverse();
            
            if (resDin[0] !== undefined) {
                for (let i = 0; i < 50; i++) {
                    if (message[i] == undefined) {
                        break;
                    }
                    const query2 = "select textchat.user.username as username, textchat.user.picture as pfp, textchat.user.color as color from textchat.user where textchat.user.iduser=" + mysql.escape(message[i].sender);
                    con.query(query2, function (err, resD) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        emitNewMessage(socket, resD[0].username, resDin[i].content, resD[0].pfp, resD[0].color, resDin[i].time, false, false);
                    });
                }
            }
        });
    });
});