fs = require("fs");
exports.getUsers = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("database/usersData.json", function (err, usersData) {
            var users = JSON.parse(usersData).users;
            resolve(users);
        });
    });
};

exports.findUserWithId = (id) => {
    return new Promise((resolve, reject) => {
        fs.readFile("database/usersData.json", function (err, usersData) {
            var users = JSON.parse(usersData).users;
            var user = users.find((user) => {
                return user.id == id;
            });
            resolve(user);
        });
    });
};

exports.findUserWithUserName = (username) => {
    return new Promise((resolve, reject) => {
        fs.readFile("database/usersData.json", function (err, usersData) {
            var users = JSON.parse(usersData).users;
            var user = users.find((user) => {
                return user.username == username;
            });
            resolve(user);
        });
    });
};

exports.setUsers = (users) => {
    fs.writeFile(
        "database/usersData.json",
        JSON.stringify({ users: users }),
        function (err) {
            if (err) {
                console.log(err);
            }
        }
    );
};
