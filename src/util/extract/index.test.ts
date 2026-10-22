/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { MailData } from '../../../tests/javascript/extractFixtureLoading.ts'
import type { ExtractedEmail } from '../../model/ExtractedEmail.ts'

import { describe, expect, test } from 'vitest'
import { loadAttachmentCases, loadBodyCases, loadMetadataCases } from '../../../tests/javascript/extractFixtureLoading.ts'
import { MailProcessingError } from '../../model/MailProcessingError.ts'
import { EML_MIME_TYPE, MSG_MIME_TYPE } from '../../model/MimeType.ts'
import { extractEmail } from './index.ts'

const formats = ['eml', 'msg'] as const

describe('extractEmail', () => {
	describe.each(formats)('.%s', async (format) => {
		describe('body', async () => {
			const { successCases, errorCases } = await loadBodyCases()

			test.each(successCases)('$description', async ({ mailData, expectedBody }) => {
				const result = await extractCase(mailData, format)

				expect(result.body).toStrictEqual(expectedBody)
			})

			test.each(errorCases)('rejects $description', async ({ mailData, error }) => {
				await expect(extractCase(mailData, format)).rejects
					.toStrictEqual(new MailProcessingError(error))
			})
		})

		describe('metadata', async () => {
			const cases = await loadMetadataCases()

			test.each(cases)('$description', async ({ mailData, expectedMetadata }) => {
				const result = await extractCase(mailData, format)

				expect(result.metadata).toMatchObject(expectedMetadata)
			})
		})

		describe('attachments', async () => {
			const cases = await loadAttachmentCases()

			test.each(cases)('$description', async ({ mailData, expectedAttachments }) => {
				const result = await extractCase(mailData, format)

				expect(result.attachments).toStrictEqual(expectedAttachments)
			})
		})
	})

	test('rejects an empty .msg file, which msgreader cannot read', async () => {
		const extraction = extractEmail(new ArrayBuffer(0), MSG_MIME_TYPE)

		await expect(extraction).rejects.toStrictEqual(new MailProcessingError('Invalid .msg file'))
		await expect(extraction).rejects.toHaveProperty('cause', expect.any(RangeError))
	})

	test('rejects a file that is not a .msg file, which msgreader reports', async () => {
		const buffer = new TextEncoder().encode('Hello '.repeat(200)).buffer
		const extraction = extractEmail(buffer, MSG_MIME_TYPE)

		await expect(extraction).rejects.toStrictEqual(new MailProcessingError('Invalid .msg file'))
		await expect(extraction).rejects.toHaveProperty('cause', new Error('Unsupported file type!'))
	})

	test('rejects unsupported mime types', async () => {
		await expect(extractEmail(new ArrayBuffer(0), 'text/plain')).rejects
			.toStrictEqual(new MailProcessingError('Unsupported mime type: text/plain'))
	})
})

/**
 * @param mailData mail data of the test case
 * @param format format to extract the test case as
 */
async function extractCase(mailData: MailData, format: 'eml' | 'msg'): Promise<ExtractedEmail> {
	switch (format) {
		case 'eml': {
			const emlFile = await mailData.loadAsEml()
			return extractEmail(emlFile, EML_MIME_TYPE)
		}
		case 'msg': {
			const msgFile = await mailData.loadAsMsg()
			return extractEmail(msgFile, MSG_MIME_TYPE)
		}
	}
}
