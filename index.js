const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const Busboy = require('busboy');
const passport = require('passport');
const escapehtml = require('escape-html');

// local abstraction modules
const auth = require('./auth');
const storage = require('./storage');

let app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(session({secret: 'foobar', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'hbs')

auth.initPassport(passport);
auth.createUsers({
    'pca': 'password'
});

// Guard user APIs/Pages
app.use((req, res, next) => {
    if (req.user == null && req.path.indexOf('/user') === 0) {
        res.redirect('/login.html');
    }
    next();
})
app.use(express.static('public'));

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

app.post('/user/upload.html',
    (req, res) => {
        let images = [];
        let tags = [];
        let title = '';
        let content = '';
        let busboy = new Busboy({headers: req.headers});
        busboy.on('file', (field, file, _filename, _encoding, mimetype) => {
            if (field != 'picture' || !mimetype.startsWith('image')) {
                file.resume();
                return;
            }
            images.push(storage.add_image(file, mimetype));
        });
        busboy.on('field', function (fieldname, val) {
            if (fieldname === 'content') {
                content = escapehtml(val);
            } else if (fieldname === 'tags') {
                tags = content.split(' ');
            } else if (fieldname === 'title') {
                title = escapehtml(val);
            }
        });
        busboy.on('finish', () => {
            let id = storage.add_post(title, req.user, images, content, tags);
            res.status(200);
            res.redirect(`/posts/${id}`);
        });
        return req.pipe(busboy);
    })

app.get('/', (req, res) => {
    res.render('feed', {posts: storage.get_posts()});
})

app.get('/:id', (req, res) => {
    res.render('post', storage.get_post_with_id(req.params.id));
})

app.listen(3000, () => console.log('started at 3000'));


