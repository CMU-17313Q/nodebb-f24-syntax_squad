'use strict';

const db = require('../database');
const posts = require('./index'); // Assuming this file is in the same directory

module.exports = function (Posts) {
    Posts.markPostAsBest = async function (pid) {
        // Get the topic ID associated with the post
        const post = await posts.getPostFields(pid, ['tid']);
        const tid = post.tid;

        // Set the best response PID for the topic directly
        await db.setObjectField(`tid:${tid}`, 'bestResponse', 100);

        const updatedTopicData = await db.getObject(`topic:${tid}`);

        const bestResponse = await db.getObjectField(`topic:${tid}`, 'bestResponse');

        return { success: true, message: 'Post marked as best response.' };
    };
};