fs = require("fs");
exports.getMessages = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("database/messagesData.json", function (err, messagesData) {
            var messages = JSON.parse(messagesData).messages;
            resolve(messages);
        });
    });
};

exports.setMessages = (messages) => {
    fs.writeFile(
        "database/messagesData.json",
        JSON.stringify({ messages: messages }),
        function (err) {
            if (err) {
                console.log(err);
            }
        }
    );
};
