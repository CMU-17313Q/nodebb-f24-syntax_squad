'use strict';

const db = require('../database');
const posts = require('./index'); // Assuming this file is in the same directory

module.exports = function (Posts) {
	Posts.markPostAsBest = async function (pid) {
		// Get the topic ID associated with the post using destructuring
		const { tid } = await posts.getPostFields(pid, ['tid']);

		// Set the best response PID for the topic directly
		await db.setObjectField(`tid:${tid}`, 'bestResponse', 100);

		// Optionally, retrieve the updated bestResponse field from the topic (if needed)
		const bestResponse = await db.getObjectField(`topic:${tid}`, 'bestResponse');
		console.log('Best Response Updated:', bestResponse); // If you need to log this

		return { success: true, message: 'Post marked as best response.' };
	};
};
