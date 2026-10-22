/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { ExtractedEmail } from '../../model/ExtractedEmail.ts'

import { MailProcessingError } from '../../model/MailProcessingError.ts'
import { EML_MIME_TYPE, MSG_MIME_TYPE } from '../../model/MimeType.ts'
import { extractEml } from './eml.ts'
import { extractMsg } from './msg.ts'

/**
 * Extract the body, metadata and attachments of an email file.
 *
 * @param buffer file content
 * @param mime file mime type, {@link EML_MIME_TYPE} or {@link MSG_MIME_TYPE}
 * @throws {MailProcessingError}
 */
export async function extractEmail(buffer: ArrayBuffer, mime: string): Promise<ExtractedEmail> {
	switch (mime) {
		case EML_MIME_TYPE:
			return extractEml(buffer)
		case MSG_MIME_TYPE:
			return extractMsg(buffer)
		default:
			throw new MailProcessingError(`Unsupported mime type: ${mime}`)
	}
}
