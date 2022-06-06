var fs = require("fs");
var express = require("express");
let session = require("express-session");
let sessionOptions = {
    secret: "hachihao",
    cookie: {
        maxAge: 269999999999,
    },
    saveUninitialized: true,
    resave: true,
};

const bodyParser = require("body-parser");

const { loginController, logout } = require("./controllers/loginController");
const {
    messageController,
    initMessageNotifySocket,
} = require("./controllers/messageController");
const {
    navigateToEditUser,
    editUser,
    navigateToViewUser,
} = require("./controllers/userController");

var app = express();

app.use(session(sessionOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
    fs.readFile("resources/login.html", function (err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(data);
    });
});

app.post("/login", loginController);
app.get("/logout", logout);
app.get("/messages", messageController);
app.get("/editUser", navigateToEditUser);
app.put("/editUser", editUser);
app.get("/viewUser", navigateToViewUser);

const port = 8080;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

initMessageNotifySocket(server);
