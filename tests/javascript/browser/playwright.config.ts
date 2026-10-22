/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineConfig } from '@playwright/test'

const PORT = 5179
const URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
	testDir: '../../../src',
	testMatch: '**/*.browser.test.ts',
	outputDir: '../../output/playwright',
	snapshotPathTemplate: '{testDir}/../tests/fixtures/rendering-snapshots/{arg}{ext}',
	timeout: 30_000,
	fullyParallel: true,
	use: { baseURL: URL },
	webServer: {
		command: `npx webpack serve --config tests/javascript/browser/webpack.config.js --node-env development --port ${PORT}`,
		url: URL,
		// the repository, for the configurations of Babel and TypeScript
		cwd: '../../..',
		reuseExistingServer: !process.env.CI,
	},
})
