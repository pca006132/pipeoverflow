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
app.use(bodyparser.json());
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

app.post('/user/upload.html', (req, res) => {
    let images = [];
    let tags = [];
    let title = '';
    let content = '';
    let busboy = new Busboy({headers: req.headers});
    busboy.on('file', (field, file, _filename, _encoding, mimetype) => {
        if (field != 'pictures' || !mimetype.startsWith('image')) {
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

app.post('/user/reply', (req, res) => {
    let images = [];
    let content = '';
    let id = undefined;
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
        } else if (fieldname === 'id') {
            id = parseInt(val);
        }
    });
    busboy.on('finish', () => {
        if (id === undefined) {
            res.status(400);
            res.end();
            return;
        }
        storage.add_reply(id, req.user, images, content);
        res.status(200);
        res.redirect(`/posts/${id}`);
    });
    return req.pipe(busboy);
})

app.post('/user/best_reply', (req, res) => {
    if (req.body.id === undefined || req.body.index === undefined) {
        res.status(400);
        res.end();
        return;
    }
    let post = storage.get_post_with_id(req.body.id);
    // check author
    if (post.author != req.user) {
        res.status(403);
        res.end();
    }
    storage.best_reply(index, id);
    res.status(200);
    res.end();
})

app.get('/', (req, res) => {
    res.render('index', {posts: storage.get_posts(), visitor: req.user === undefined});
})

app.get('/posts/:id', (req, res) => {
    res.render('post', storage.get_post_with_id(req.params.id));
})

app.listen(3000, () => console.log('started at 3000'));


