/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
		// the browser tests run with Playwright, see tests/javascript/browser/playwright.config.ts
		exclude: ['src/**/*.browser.test.ts'],
	},
})
