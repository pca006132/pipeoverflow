const fs = require('fs');
const mime = require('mime-types');

let posts = [{
    title: 'some title',
    author: 'pca',
    images: [],
    content: 'something',
    tags: [],
    replies: [],
    id: 0,
    best: -1,
}];
let counter = 0;

module.exports = {
    get_posts: (count = 10) => {
        if (count > posts.length) {
            return posts.map(v => ({
                // remove replies
                title: v.title,
                author: v.author,
                images: v.images,
                content: v.content,
                tags: v.tags,
                id: v.id
            })).reverse();
        } else {
            let start = posts.length - count;
            return posts.slice(start).reverse();
        }
    },
    get_post_with_id: id => {
        if (id >= 0 && posts.length > id) {
            return posts[id];
        }
        return null;
    },
    get_user_posts: author => {
        return posts.filter(v => v.author == author);
    },
    add_image: (fstream, mimetype) => {
        const ext = mime.extension(mimetype);
        const dest = `uploads/${counter++}-img.${ext}`;
        fstream.pipe(fs.createWriteStream('./public/' + dest));
        return dest;
    },
    add_post: (title, author, images, content, tags) => {
        let id = posts.length;
        let post = {
            title: title,
            author: author,
            images: images,
            content: content,
            tags: tags,
            id: id,
            replies: [],
            best: -1
        };
        posts.push(post);
        return id;
    },
    add_reply: (id, author, images, content) => {
        if (!posts[id]) {
            return;
        }
        if (posts[id].best != -1) {
            return;
        }
        let reply = {
            author: author,
            images: images,
            content: content,
            flagged: false
        };
        posts[id].replies.push(reply);
    },
    best_reply: (index, id) => {
        if (!posts[id]) {
            return;
        }
        if (posts[id].best != -1) {
            return;
        }
        if (index < 0 || index >= posts[id].length) {
            return;
        }
        posts[id].best = index;
    },
}

