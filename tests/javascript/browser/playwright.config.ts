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
	outputDir: '../../output/browser/test-results',
	reporter: process.env.CI ? 'github' : [['html', { outputFolder: '../../output/browser/report' }]],
	snapshotPathTemplate: '{testDir}/../tests/fixtures/rendering-snapshots/{arg}{ext}',
	timeout: 30_000,
	fullyParallel: true,
	use: { baseURL: URL },
	webServer: {
		command: `npx vite build --config tests/javascript/browser/vite.config.mts --mode development && npx vite preview --config tests/javascript/browser/vite.config.mts --host 127.0.0.1 --port ${PORT} --strictPort`,
		url: URL,
		// the repository, for the configurations of Vite and TypeScript
		cwd: '../../..',
		reuseExistingServer: !process.env.CI,
	},
})
