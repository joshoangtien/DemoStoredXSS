var fs = require("fs");
const socketio = require("socket.io");
var messageDAO = require("../dao/messageDAO");
var userDAO = require("../dao/userDAO");

exports.messageController = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    fs.readFile("resources/messages.html", function (err, html) {
        messageDAO.getMessages().then((messages) => {
            userDAO.getUsers().then((users) => {
                html = html.toString();
                var messagesHTML = "";

                for (var i = 0; i < messages.length; i++) {
                    var currentUser = users.find((user) => {
                        return user.id == messages[i].user_id;
                    });

                    messagesHTML += `<tr><td class="username" style="cursor: pointer;">${currentUser.username}:</td><td>${messages[i].content}</td></tr>`;
                }

                html = html.replace("{{messages}}", messagesHTML);
                html = html.replace(
                    '"{{loggedInUser}}"',
                    `{id: ${req.session.loggedInUser.id}, username: "${req.session.loggedInUser.username}"}`
                );

                res.writeHead(200, { "Content-Type": "text/html" });
                return res.end(html);
            });
        });
    });
};

const addNewMessageToDB = (newMessageData) => {
    messageDAO.getMessages().then((messages) => {
        var userId = newMessageData.userId;
        var newMessage = newMessageData.message;

        messages.push({
            id: messages.length + 1,
            content: newMessage,
            user_id: userId,
        });

        messageDAO.setMessages(messages);
    });
};

exports.initMessageNotifySocket = (server) => {
    const io = socketio(server);
    io.on("connection", (socket) => {
        // Listen for client message
        socket.on("message", (received) => {
            console.log("received new message from client: " + received);

            addNewMessageToDB(JSON.parse(received));

            io.emit("message", received);
        });

        // Runs when client disconnects
        socket.on("disconnect", () => { });
    });
};
