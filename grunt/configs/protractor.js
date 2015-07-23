module.exports = {
	protractor: {
		'e2e-chrome': {
			options: {
				configFile: 'tests/config/e2e.chrome.conf.js'
			}
		},
		'e2e-firefox': {
			options: {
				configFile: 'tests/config/e2e.firefox.conf.js'
			}
		},
		'smoke-chrome': {
			options: {
				configFile: 'tests/config/smoke.chrome.conf.js'
			}
		},
		'smoke-firefox': {
			options: {
				configFile: 'tests/config/smoke.firefox.conf.js'
			}
		}
	}
};
