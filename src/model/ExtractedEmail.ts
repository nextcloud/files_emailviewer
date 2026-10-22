/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export interface MailAddress {
	name: string | null
	/** null if there is no real email address, like for an Exchange address, which is then part of the name */
	address: string | null
}

export interface HtmlMailBody {
	html: string
}

export interface PlainMailBody {
	/** only if there is no HTML body */
	plain: string
}

export type MailBody = HtmlMailBody | PlainMailBody

export interface MailMetadata {
	subject: string | null
	from: MailAddress | null
	to: MailAddress[]
	cc: MailAddress[]
	sentDate: Date | null
}

export interface InlineMailAttachment {
	/** without angle brackets, referenced as `cid:<contentId>` in the HTML body */
	contentId: string
	filename: string | null
	mimeType: string
	data: Uint8Array
}

export interface FileMailAttachment {
	filename: string | null
}

export interface MailAttachments {
	inline: InlineMailAttachment[]
	files: FileMailAttachment[]
}

export interface ExtractedEmail {
	body: MailBody
	metadata: MailMetadata
	attachments: MailAttachments
}
