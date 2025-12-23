module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{svg,ico,gif,png,json,js}'
	],
	swDest: 'public/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/,
		/^homescreen/
	]
};