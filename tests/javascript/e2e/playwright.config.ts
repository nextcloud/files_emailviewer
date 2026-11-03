/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: '.',
	outputDir: '../../output/e2e/test-results',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: process.env.CI ? 'github' : [['html', { outputFolder: '../../output/e2e/report' }]],
	use: {
		baseURL: 'http://localhost:8089/index.php/',
		trace: 'on-first-retry',
	},

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
			},
		},
		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
			},
		},
	],

	webServer: {
		command: 'npm run start:nextcloud',
		// the repository, for appinfo/info.xml and the container name, which is derived from the working directory
		cwd: '../../..',
		reuseExistingServer: false,
		// No `url`, Playwright would start tests as soon as either `url` or `wait` is ready,
		// but the URL is reachable before Nextcloud is configured.
		wait: {
			stdout: /Nextcloud is configured for files_emailviewer tests/,
		},
		stderr: 'pipe',
		stdout: 'pipe',
		timeout: 5 * 60 * 1000, // max. 5 minutes for creating the container
		// Without it the server process is SIGKILLed and can't remove the container
		gracefulShutdown: {
			signal: 'SIGTERM',
			timeout: 30 * 1000,
		},
	},
})
