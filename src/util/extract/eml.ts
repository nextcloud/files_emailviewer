/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { Address, Attachment } from 'postal-mime'
import type { ExtractedEmail, MailAddress, MailAttachments } from '../../model/ExtractedEmail.ts'

import PostalMime from 'postal-mime'
import { nonEmptyOrNull, toContentId, toDate, toMailAddress, toMailBody } from './common.ts'

/**
 * @param buffer `.eml` file content
 * @throws {MailProcessingError}
 */
export async function extractEml(buffer: ArrayBuffer): Promise<ExtractedEmail> {
	const email = await PostalMime.parse(buffer)

	return {
		body: toMailBody(email.html, email.text),
		metadata: {
			subject: nonEmptyOrNull(email.subject),
			from: toSender(email.from),
			to: toMailAddresses(email.to ?? []),
			cc: toMailAddresses(email.cc ?? []),
			sentDate: toDate(email.date),
		},
		attachments: toMailAttachments(email.attachments),
	}
}

/**
 * @param from mailbox or group
 * @return the mailbox, or the first member of a group
 */
function toSender(from: Address | undefined): MailAddress | null {
	if (from === undefined) {
		return null
	}

	const [sender] = toMailAddresses([from])
	if (sender === undefined) {
		return null
	}
	return sender
}

/**
 * @param addresses mailboxes and groups
 * @return mailboxes, with groups replaced by their members
 */
function toMailAddresses(addresses: Address[]): MailAddress[] {
	return addresses
		.flatMap((address) => address.group ?? [address])
		.map(({ name, address }) => toMailAddress(name, address))
}

/**
 * @param attachments parsed attachments, with binary content
 * @return attachments with a content ID as inline, the others as files
 */
function toMailAttachments(attachments: Attachment[]): MailAttachments {
	const result: MailAttachments = { inline: [], files: [] }
	for (const attachment of attachments) {
		const contentId = toContentId(attachment.contentId)
		if (contentId === null) {
			result.files.push({ filename: nonEmptyOrNull(attachment.filename) })
		} else {
			result.inline.push({
				contentId,
				filename: nonEmptyOrNull(attachment.filename),
				mimeType: attachment.mimeType,
				data: new Uint8Array(attachment.content as ArrayBuffer | Uint8Array),
			})
		}
	}
	return result
}
