/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect } from '@playwright/test'
import { test } from './support/fixtures.ts'

const EMAIL_FILE_NAME = 'hello.eml'
const EMAIL_SUBJECT = 'Greetings from the e2e test'
const EMAIL_BODY = 'This text is rendered into the PDF.'
const EMAIL = `From: Alice <alice@example.com>
To: Bob <bob@example.com>
Subject: ${EMAIL_SUBJECT}
Date: Mon, 02 Nov 2026 08:00:00 +0000
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

${EMAIL_BODY}
`.replaceAll('\n', '\r\n')

test('Opening an email shows it as PDF in the PDF viewer', async ({ page, uploadFile }) => {
	await uploadFile(EMAIL_FILE_NAME, EMAIL)
	await page.goto('apps/files')

	await page.locator(`[data-cy-files-list-row-name="${EMAIL_FILE_NAME}"] [data-cy-files-list-row-name-link]`).click()

	// The PDF viewer shows the PDF in an iframe from a `blob:` URL, which the Content Security Policy has to allow.
	const pdfViewer = page.frameLocator('iframe[src*="files_pdfviewer"]')
	await expect(pdfViewer.locator('.textLayer').getByText(EMAIL_SUBJECT)).toBeVisible({ timeout: 15_000 })
	await expect(pdfViewer.locator('.textLayer').getByText(EMAIL_BODY)).toBeVisible()
})
