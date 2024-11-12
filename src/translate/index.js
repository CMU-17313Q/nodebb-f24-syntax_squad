'use strict';

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	const TRANSLATOR_API = 'https://nodebb-f24-translator.azurewebsites.net/';
	const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`);
	const data = await response.json();
	return [data.is_english, data.translated_content];
};
