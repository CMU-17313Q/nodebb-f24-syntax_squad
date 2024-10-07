'use strict';

const db = require('../database');
const posts = require('./index'); // Assuming this file is in the same directory

module.exports = function (Posts) {
    Posts.markPostAsBest = async function (pid) {
        const post = await posts.getPostFields(pid, ['tid']);
        const tid = post.tid;

        await db.setObjectField(`tid:${tid}`, 'bestResponsePid', pid);

        return { success: true, message: 'Post marked as best response.' };
    };
};
