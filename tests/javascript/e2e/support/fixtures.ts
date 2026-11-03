/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { User } from '@nextcloud/e2e-test-server'

import { createRandomUser, login } from '@nextcloud/e2e-test-server/playwright'
import { test as base, expect } from '@playwright/test'

interface Fixtures {
	user: User
	uploadFile: (fileName: string, content: string) => Promise<void>
}

/**
 * Each test gets a new random user, and its page is logged in as that user.
 */
export const test = base.extend<Fixtures>({
	user: async ({ page }, use) => {
		const user = await createRandomUser()
		await login(page.request, user)
		await use(user)
	},

	/**
	 * Upload a file into the root folder of the user.
	 *
	 * Nextcloud detects the MIME type from the file extension.
	 * Uses Basic auth from a context without the session cookie of `page`, which would require a CSRF token.
	 */
	uploadFile: async ({ request, baseURL, user }, use) => {
		await use(async (fileName, content) => {
			const response = await request.put(new URL(`../remote.php/dav/files/${user.userId}/${fileName}`, baseURL).href, {
				data: content,
				headers: {
					Authorization: `Basic ${Buffer.from(`${user.userId}:${user.password}`).toString('base64')}`,
				},
			})
			expect(response.status()).toBe(201)
		})
	},
})
