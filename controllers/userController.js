var fs = require("fs");
var userDAO = require("../dao/userDAO");
var messageDAO = require("../dao/messageDAO");

exports.navigateToEditUser = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    userDAO.getUsers().then((users) => {
        var currentUser = users.find((user) => {
            return user.id == req.session.loggedInUser.id;
        });

        fs.readFile("resources/editUser.html", function (err, html) {
            res.writeHead(200, {
                "Content-Type": "text/html",
                //"Content-security-policy": "default-src 'self'",
            });

            html = html.toString();
            html = html.replace("{{username}}", currentUser.username);
            html = html.replace("{{introduction}}", currentUser.introduction);

            return res.end(html);
        });
    });
};

exports.editUser = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    userDAO.getUsers().then((users) => {
        var userIndex = users.findIndex((user) => {
            return user.id == req.session.loggedInUser.id;
        });

        //escape introduction
        var newIntroduction = req.body.introduction;
        // newIntroduction = newIntroduction.replace(/&/g, "&amp;");
        // newIntroduction = newIntroduction.replace(/</g, "&lt;");
        // newIntroduction = newIntroduction.replace(/>/g, "&gt;");
        // newIntroduction = newIntroduction.replace(/"/g, "&quot;");
        // newIntroduction = newIntroduction.replace(/'/g, "&#039;");

        users[userIndex].introduction = newIntroduction;
        req.session.loggedInUser = users[userIndex];

        userDAO.setUsers(users);
    });
};

exports.navigateToViewUser = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    userDAO.getUsers().then((users) => {
        messageDAO.getMessages().then((messages) => {
            let messageIndex = req.query.messageindex;

            var currentUser = users.find((user) => {
                return user.id == messages[messageIndex].user_id;
            });

            fs.readFile("resources/viewUser.html", function (err, html) {
                res.writeHead(200, {
                    "Content-Type": "text/html",
                    //"Content-security-policy": "default-src 'self'",
                });

                html = html.toString();
                html = html.replace("{{username}}", currentUser.username);
                html = html.replace(
                    "{{introduction}}",
                    currentUser.introduction
                );

                return res.end(html);
            });
        });
    });
};
