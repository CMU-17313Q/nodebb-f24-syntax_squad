'use strict';

const db = require('../database');
const posts = require('./index'); // Assuming this file is in the same directory

module.exports = function (Posts) {
    Posts.markPostAsBest = async function (pid) {
        console.log('markPostAsBest function is called');
        // Get the topic ID associated with the post
        const post = await posts.getPostFields(pid, ['tid']);
        const tid = post.tid;

        // Set the best response PID for the topic directly
        await db.setObjectField(`tid:${tid}`, 'bestResponse', pid);

        console.log('Best response PID set for topic:', tid, 'to post:', pid); // Log success

        const updatedTopicData = await db.getObject(`topic:${tid}`);
        console.log('Updated topic data:', updatedTopicData);

        const updatedPostData = await db.getObject(`post:${pid}`);
        console.log('Updated topic data:', updatedPostData);

        return { success: true, message: 'Post marked as best response.' };
    };
};