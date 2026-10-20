/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { FieldsData } from '@kenjiuno/msgreader'
import type { ExtractedEmail, MailAddress, MailAttachments, MailBody } from '../../model/ExtractedEmail.ts'

import MsgReader from '@kenjiuno/msgreader'
import { translate as t } from '@nextcloud/l10n'
import { MailProcessingError } from '../../model/MailProcessingError.ts'
import { decodeCodepage, toAnsiCodepage, toIconvName } from './codepage.ts'
import { nonEmptyOrNull, toContentId, toDate, toMailAddress, toMailBody } from './common.ts'

/**
 * @param buffer `.msg` file content
 * @throws {MailProcessingError}
 */
export function extractMsg(buffer: ArrayBuffer): ExtractedEmail {
	const { reader, msg } = readMsg(buffer)
	const recipients = msg.recipients ?? []

	let html = msg.bodyHtml
	if (html === undefined && msg.html !== undefined) {
		html = decodeCodepage(msg.html, msg.internetCodepage)
	}

	let from: MailAddress | null = null
	const senderAddress = msg.senderSmtpAddress ?? msg.senderEmail
	if (senderAddress !== undefined) {
		from = toMailAddress(msg.senderName, senderAddress)
	}

	return {
		body: toMsgBody(html, msg),
		metadata: {
			subject: nonEmptyOrNull(msg.subject),
			from,
			to: toMailAddresses(recipients.filter(({ recipType }) => recipType === 'to')),
			cc: toMailAddresses(recipients.filter(({ recipType }) => recipType === 'cc')),
			sentDate: toDate(msg.clientSubmitTime),
		},
		attachments: toMailAttachments(reader, msg.attachments ?? []),
	}
}

/**
 * Outlook often stores the formatted body only as compressed RTF, even if it was HTML, often with a plain text version.
 * Without an HTML or plain text body to fall back to, the body is a message that it is not supported,
 * so that the metadata and attachments are still shown.
 *
 * @param html HTML body, undefined if there is none
 * @param msg fields of the `.msg` file
 * @throws {MailProcessingError} if there is no body at all
 */
function toMsgBody(html: string | undefined, msg: FieldsData): MailBody {
	if (html === undefined && msg.body === undefined && msg.compressedRtf !== undefined) {
		return { plain: t('files_emailviewer', 'The body of this email is only stored as compressed RTF, which is not supported. The email has no HTML or plain text version of the body to show instead.') }
	}
	return toMailBody(html, msg.body)
}

/**
 * Parses the `.msg` file.
 *
 * @param buffer `.msg` file content
 * @return reader of the `.msg` file, and the fields it read
 * @throws {MailProcessingError}
 */
function readMsg(buffer: ArrayBuffer): { reader: MsgReader, msg: FieldsData } {
	const reader = new MsgReader(buffer)
	const msg = readFields(reader)
	// Without an encoding, msgreader decodes non-Unicode string properties byte by byte as Latin-1.
	// Their code page is only known after reading the file, so it is read again with that encoding.
	// Without a code page, the ANSI code page of the locale of the message is used, like 932 for Japanese.
	const ansiEncoding = toIconvName(msg.messageCodepage ?? toAnsiCodepage(msg.messageLocaleId))
	if (ansiEncoding === null) {
		return { reader, msg }
	}
	const decodingReader = new MsgReader(buffer)
	decodingReader.parserConfig = { ansiEncoding }
	return { reader: decodingReader, msg: readFields(decodingReader) }
}

/**
 * @param reader reader of the `.msg` file
 * @throws {MailProcessingError}
 */
function readFields(reader: MsgReader): FieldsData {
	let msg: FieldsData
	try {
		msg = reader.getFileData()
	} catch (error) {
		throw new MailProcessingError('Invalid .msg file', { cause: error })
	}
	if (msg.error !== undefined) {
		throw new MailProcessingError('Invalid .msg file', { cause: new Error(msg.error) })
	}
	return msg
}

/**
 * @param recipients parsed recipients
 * @return the recipients, with the SMTP address, the email address, or the display name if there is no address
 */
function toMailAddresses(recipients: FieldsData[]): MailAddress[] {
	const addresses: MailAddress[] = []
	for (const recipient of recipients) {
		const address = recipient.smtpAddress ?? recipient.email ?? recipient.name
		if (address !== undefined) {
			addresses.push(toMailAddress(recipient.name, address))
		}
	}
	return addresses
}

/**
 * @param reader reader of the `.msg` file
 * @param attachments parsed attachments
 * @return attachments with a content ID as inline, the others as files
 */
function toMailAttachments(reader: MsgReader, attachments: FieldsData[]): MailAttachments {
	const result: MailAttachments = { inline: [], files: [] }
	for (const attachment of attachments) {
		const contentId = toContentId(attachment.pidContentId)
		if (contentId === null) {
			result.files.push({ filename: nonEmptyOrNull(attachment.fileName) })
		} else {
			result.inline.push({
				contentId,
				filename: nonEmptyOrNull(attachment.fileName),
				mimeType: attachment.attachMimeTag ?? 'application/octet-stream',
				data: reader.getAttachment(attachment).content,
			})
		}
	}
	return result
}
