/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect, test } from '@playwright/test'
import { loadTransformCases } from '../../../tests/javascript/transformFixtureLoading.ts'

const FILES = [
	'transform/sanitization.yaml',
	'transform/inlineResources.yaml',
]

for (const file of FILES) {
	test.describe(`sanitizeHtml with ${file}`, () => {
		for (const transformCase of loadTransformCases(file)) {
			test(transformCase.description, async ({ page }) => {
				await page.goto('/')
				const result = await page.evaluate(function transformInPage({ html, inline }) {
					return window.transformHtml(html, inline)
				}, { html: transformCase.raw, inline: transformCase.inline })

				expect(result.html).toBe(transformCase.sanitized)
				expect(result.unusedInline).toStrictEqual(transformCase.unusedInline)
			})
		}
	})
}
