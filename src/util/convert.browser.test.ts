/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect, test } from '@playwright/test'
import { listRenderingCases, loadMail } from '../../tests/javascript/convertFixtureLoading.ts'

for (const renderingCase of listRenderingCases()) {
	test(renderingCase.file, async ({ page }) => {
		const { mail, mime } = await loadMail(renderingCase)
		await page.goto('/')
		const { pdf, error } = await page.evaluate(function renderInPage({ mail, mime }) {
			return window.renderEmail(mail, mime)
		}, { mail: mail.toString('base64'), mime })

		expect(error).toBeNull()
		expect(Buffer.from(pdf!, 'base64')).toMatchSnapshot([`${renderingCase.file}.pdf`])
	})
}
