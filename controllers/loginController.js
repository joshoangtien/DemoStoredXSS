var userDAO = require("../dao/userDAO");

exports.loginController = (req, res) => {
    userDAO.findUserWithUserName(req.body.username).then((user) => {
        if (user) {
            //check password
            if (user.password == req.body.password) {
                req.session.loggedInUser = user;
                return res.redirect("/messages");
            } else {
                //login fail
                return res.end("Wrong password");
            }
        } else {
            //login fail
            return res.end("User not found");
        }
    });
};

exports.logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
