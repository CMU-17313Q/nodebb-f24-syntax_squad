'use strict';

const topics = require('../topics');
const user = require('../user');
const utils = require('../utils');
const db = require('../database'); // Ensure db is imported correctly

module.exports = function (Posts) {
	Posts.getPostsFromSet = async function (set, start, stop, uid, reverse) {
		const pids = await Posts.getPidsFromSet(set, start, stop, reverse);
		const posts = await Posts.getPostsByPids(pids, uid);
		return await user.blocks.filter(uid, posts);
	};

	Posts.isMain = async function (pids) {
		const isArray = Array.isArray(pids);
		pids = isArray ? pids : [pids];
		const postData = await Posts.getPostsFields(pids, ['tid']);
		const topicData = await topics.getTopicsFields(postData.map(t => t.tid), ['mainPid']);
		const result = pids.map((pid, i) => parseInt(pid, 10) === parseInt(topicData[i].mainPid, 10));
		return isArray ? result : result[0];
	};

	Posts.getTopicFields = async function (pid, fields) {
		const tid = await Posts.getPostField(pid, 'tid');
		return await topics.getTopicFields(tid, fields);
	};

	Posts.generatePostPath = async function (pid, uid) {
		const paths = await Posts.generatePostPaths([pid], uid);
		return Array.isArray(paths) && paths.length ? paths[0] : null;
	};

	Posts.generatePostPaths = async function (pids, uid) {
		const postData = await Posts.getPostsFields(pids, ['pid', 'tid']);
		const tids = postData.map(post => post && post.tid);
		const [indices, topicData] = await Promise.all([
			Posts.getPostIndices(postData, uid),
			topics.getTopicsFields(tids, ['slug']),
		]);

		const paths = pids.map((pid, index) => {
			const slug = topicData[index] ? topicData[index].slug : null;
			const postIndex = utils.isNumber(indices[index]) ? parseInt(indices[index], 10) + 1 : null;

			if (slug && postIndex) {
				const index = postIndex === 1 ? '' : `/${postIndex}`;
				return `/topic/${slug}${index}`;
			}
			return null;
		});

		return paths;
	};

	Posts.markPostAsBest = async function (pid) {
		// Get the topic ID associated with the post
		const { tid } = await Posts.getPostFields(pid, ['tid']); // Object destructuring
		// Set the best response for the topic
		await db.setObjectField(`topic:${tid}`, 'bestResponse', pid);
		// Retrieve the updated topic data
		const updatedTopicData = await db.getObject(`topic:${tid}`);
		return { success: true, topic: updatedTopicData }; // Return full topic data
	};
};
