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
            replies: []
        };
        posts.push(post);
        return id;
    }
}

