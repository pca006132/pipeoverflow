const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const Busboy = require('busboy');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mime = require('mime-types');
const escapehtml = require('escape-html');

const bcrypt = require('bcrypt');
const saltRounds = 10;

let app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(session({secret: 'foobar', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//     if (req.user == null && req.path.indexOf('/upload.html') === 0) {
//         res.redirect('/login.html');
//     }
//     next();
// })
app.use(express.static('public'));

// just somehow substitute them with your fancy DB system!
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

let posts = [];
let counter = 0;
app.post('/upload.html',
    (req, res) => {
        let files = [];
        let content;
        let busboy = new Busboy({headers: req.headers});
        busboy.on('file', (field, file, _filename, _encoding, mimetype) => {
            if (field != 'picture' || !mimetype.startsWith('image')) {
                file.resume();
                return;
            }
            const ext = mime.extension(mimetype);
            const dest = `uploads/${counter++}-img.${ext}`;
            files.push(dest);
            file.pipe(fs.createWriteStream('./public/' + dest));
        });
        busboy.on('field', function (fieldname, val) {
            if (fieldname != 'content') {
                return;
            }
            content = escapehtml(val);
        });
        busboy.on('finish', () => {
            let post = {files: files, content: content};
            posts.push(post);
            console.log(post);
            res.status(200);
            res.end();
        });
        return req.pipe(busboy);
    })

app.listen(3000, () => console.log('started at 3000'));


