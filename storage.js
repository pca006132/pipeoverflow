const fs = require('fs');
const mime = require('mime-types');

let posts = [{
    author: 'random guy',
    urgent: false,
    images: [{
        src: 'assets/3.jpg',
        caption: "There's noticable discoloration of the pipes, is that of any concern?"
    },{
        src: 'assets/11.jpg',
        caption: "This is what it looked like when it was new."
    },{
        src: 'assets/10.jpg',
        caption: "Another photo of the current situation."
    }],
    tags: [],
    replies: [{
        title: "Minor Issues, only routine maintenance needed.",
        msg: "Slight discoloration of the pipes are to be expected after a few years of use. No immidiate concern, but preventative maintenance can be done if you don't feel safe about it.",
        best: true,
        reported: false,
        author: 'sifu1',
        author_img: "assets/sifu1.jpg",
    }, {
        title: "Should redo all plumming.",
        msg: "When in doubt, just rip everything out and replace it. We currently offer rebuild services for only 8888HKD.",
        best: false,
        reported: false,
        author: 'sifu2',
        author_img: "assets/sifu2.jpg",
    }, {
        title: "Pipes Pipes Pipes",
        msg: "Hahaha, pipes funny.",
        best: false,
        reported: true,
        author: 'sifu3',
        author_img: "assets/sifu3.jpg",
    }],
    id: 0,
    has_best: true
}, {
    author: 'random guy 2',
    urgent: true,
    images: [{
        src: 'assets/1.jpg',
        caption: "Is this section of pipes supposed to drip?",
    }],
    tags: [],
    replies: [],
    id: 1,
    has_best: false
}, {
    author: 'random guy 3',
    urgent: true,
    images: [{
        src: 'assets/2.jpg',
        caption: "Is the vertical pipe in the center installed properly?",
    }],
    tags: [],
    replies: [],
    id: 2,
    has_best: false
}, {
    author: 'random guy 4',
    urgent: true,
    images: [{
        src: 'assets/4.jpg',
        caption: "Why can I smell raw sewage from this section of the pipe?",
    }],
    tags: [],
    replies: [],
    id: 3,
    has_best: false
}];
let counter = 0;

module.exports = {
    get_posts: (count = 10) => {
        if (count > posts.length) {
            return posts.map(v => ({
                // remove replies
                title: v.title,
                author: v.author,
                cover: v.images[0],
                replies: v.replies.length,
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
    add_post: (title, author, images, tags) => {
        let id = posts.length;
        let post = {
            title: title,
            author: author,
            images: images,
            tags: tags,
            id: id,
            replies: [],
            has_best: false
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
        if (posts[id].has_best) {
            return;
        }
        if (index < 0 || index >= posts[id].length) {
            return;
        }
        let best = posts.splice(id, 1)[0];
        best.best = true;
        posts.splice(0, 0, best);
    },
}

