const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const Busboy = require('busboy');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcrypt');
const saltRounds = 10;

let app = express();


app.use(bodyparser.urlencoded({extended: false}));
app.use(session({secret: 'foobar', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if (req.user == null && req.path.indexOf('/upload.html') === 0) {
        res.redirect('/login.html');
    }
    next();
})
app.use(express.static('public'));

let users = {};
let userList = [];

bcrypt.hash('password', saltRounds, (err, encrypted) => {
    if (err) {
        console.error(`bcrypt error: ${err}`);
        exit(1);
    }
    users['pca'] = encrypted;
    userList.push('pca');
})

passport.use(new LocalStrategy(
    function (username, password, done) {
        const user = users[username];
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

app.post('/login.html',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login.html',
        failureFlash: false
    }),
    (_, res) => {
        res.redirect('/');
    }
);


let counter = 0;
app.post('/upload.html',
    (req, res) => {
        let busboy = new Busboy({headers: req.headers});
        busboy.on('file', (field, file, filename, _, mimetype) => {
            if (field != 'picture' || !mimetype.startsWith('image')) {
                res.status(400);
                res.end();
            }
            const parts = filename.split('.');
            const ext = parts[parts.length - 1];
            const dest = `./public/uploads/${counter++}-img.${ext}`;
            file.pipe(fs.createWriteStream(dest));
        });
        busboy.on('field', function (fieldname, val, _, _, _, _) {
            if (fieldname != 'content') {
                res.status(400);
                res.end();
            }
            console.log(val);
        });
        busboy.on('finish', () => {
            console.log('upload complete');
            res.writeHead(200, {'Connection': 'close'});
            res.end();
        });
        return req.pipe(busboy);
    })

app.listen(3000, () => console.log('started at 3000'));

