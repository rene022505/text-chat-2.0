const express = require("express");
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const server = app.listen(6969, startUp);

const io = require("socket.io")(server);

const mysql = require("mysql");

const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require('uuid');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

/* LATER
con.query("SELECT * FROM textchat.user", function(err, resD) {
    bcrypt.compare("password", resD[0].password, function(err, resH) {
        console.log(resH);
    });
});
*/

function startUp() {
    console.log("Server started at " + server.address().address + ":" + server.address().port);
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));

//? Serving folder with css, js and loginpage
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/view/index.html"));
});

app.get("/register", function (req, res) {
    res.sendFile(path.join(__dirname, "public/view/register.html"));
});

app.post("/register", function (req, res) {
    if (req.body.username < 4 || req.body.username > 40) {
        res.sendStatus(403); // TODO: error if username smaller 4 or bigger 40 chars
        return;
    }

    con.query(`SELECT count(textchat.user.username) as valid FROM textchat.user WHERE textchat.user.username="${req.body.username}"`, function (err, resD) {
        if (resD[0].valid !== 0) { // TODO: error if username restriction client side bypassed
            res.sendStatus(403);
            return;
        }
    });

    if (req.body.password.length < 5 || req.body.password.length > 64) {
        res.sendStatus(403); // TODO: error if password smaller 5 or bigger 64 chars
        return;
    }

    let filetype;
    let filename;
    if (!(!req.files || Object.keys(req.files).length === 0)) {
        filetype = req.files.pfp.mimetype;
        if (filetype.substring(0, filetype.lastIndexOf("/")) !== "image")
            filename = "default.png";
        else
            filename = `${req.body.username}.${filetype.substring(filetype.lastIndexOf("/") + 1)}`;
        req.files.pfp.mv(path.join(__dirname, `profilepictures/${filename}`));
    } else {
        filename = "default.png";
    }

    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
            console.log(err);
            return;
        } 
        con.query(`INSERT INTO textchat.user(iduser, username, password, picture, color) VALUES ("${uuidv4()}", "${req.body.username}", "${hash}", "${filename}", "${req.body.color.substring(1)}");`, function (err, resD) {
            if (err) console.log(err);
        });
    });
});

app.post("/checkUsername", function (req, res) {
    con.query(`SELECT count(textchat.user.username) as valid FROM textchat.user WHERE textchat.user.username="${req.body.username}"`, function (err, resD) {
        if (resD[0].valid === 0)
            res.sendStatus(200);
        else
            res.sendStatus(403);
    });
});

io.sockets.on("connection", function (socket) {
    console.log(socket.id + " connected!");

    socket.on("reg", function (data) {
        console.log("\"" + data.name + "\" registered in the chat!");
    });

    socket.on("mes", function (data) {
        if (data.message !== "") {
            console.log("\"" + data.sender + "\" sent: " + data.message);
            io.sockets.emit("newMes", {
                sender: data.sender,
                message: data.message
            });
        }
    });
});