const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const saltRounds = 10;

// just somehow substitute them with your fancy DB system!
// and probably get something more sophisticated...
// and maybe use OAuth...
let userDB = {};
let userList = [];

module.exports = {
    initPassport: (passport) => {
        passport.use(new LocalStrategy(
            function (username, password, done) {
                const user = userDB[username];
                if (user) {
                    bcrypt.compare(password, user, (err, same) => {
                        if (err) {
                            return done(err);
                        }
                        if (same) {
                            return done(null, username);
                        } else {
                            return done(null, false, {message: 'Incorrect password.'});
                        }
                    })
                } else {
                    return done(null, false, {message: 'Incorrect username.'});
                }
            }
        ));

        passport.serializeUser(function (user, done) {
            done(null, userList.indexOf(user));
        });

        passport.deserializeUser(function (id, done) {
            if (id >= 0 && id < userList.length) {
                done(null, userList[id]);
            } else {
                done(null, false);
            }
        });
    },
    createUsers: (users) => {
        for (const [user, password] of Object.entries(users)) {
            bcrypt.hash(password, saltRounds, (err, encrypted) => {
                if (err) {
                    console.error(`bcrypt error: ${err}`);
                    exit(1);
                }
                userDB[user] = encrypted;
                userList.push(user);
            })
        }
    }
}

