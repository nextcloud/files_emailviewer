/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { FileMailAttachment, InlineMailAttachment, MailMetadata, PlainMailBody } from './ExtractedEmail.ts'

export interface SanitizedHtmlBody {
	/** content of the body, with `data:` URLs instead of the `cid:` URLs of the inline attachments */
	content: DocumentFragment
}

export type SanitizedMailBody = SanitizedHtmlBody | PlainMailBody

export interface SanitizedMailAttachments {
	files: FileMailAttachment[]
	/** the inline attachments that the body does not show, all of them for a plain text body */
	unusedInline: InlineMailAttachment[]
}

/** an extracted email whose body is safe to render, see src/util/transform/index.ts */
export interface SanitizedEmail {
	body: SanitizedMailBody
	metadata: MailMetadata
	attachments: SanitizedMailAttachments
}
