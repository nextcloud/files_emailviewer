/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * Smoke test helper: extracts an `.msg` test case and writes the result as an `.eml` file,
 * so that the `.msg` test cases also run for the `.eml` extraction.
 *
 * This is not a general conversion, it is only useful for smoke testing with the existing test cases.
 */

import type { MailAddress } from '../../src/model/ExtractedEmail.ts'

import { MSG_MIME_TYPE } from '../../src/model/MimeType.ts'
import { extractEmail } from '../../src/util/extract/index.ts'

const BOUNDARY = 'BOUNDARY'

/**
 * @param msg `.msg` file content
 */
export async function msgToEml(msg: ArrayBuffer): Promise<ArrayBuffer> {
	const { body, metadata, attachments } = await extractEmail(msg, MSG_MIME_TYPE)
	const lines = ['MIME-Version: 1.0']

	if (metadata.subject !== null) {
		lines.push(`Subject: ${encodeWord(metadata.subject)}`)
	}
	if (metadata.from !== null) {
		lines.push(`From: ${toHeaderAddress(metadata.from)}`)
	}
	if (metadata.to.length > 0) {
		lines.push(`To: ${metadata.to.map(toHeaderAddress).join(', ')}`)
	}
	if (metadata.cc.length > 0) {
		lines.push(`Cc: ${metadata.cc.map(toHeaderAddress).join(', ')}`)
	}
	if (metadata.sentDate !== null) {
		lines.push(`Date: ${metadata.sentDate.toUTCString()}`)
	}
	lines.push(`Content-Type: multipart/mixed; boundary="${BOUNDARY}"`, '')

	lines.push(`--${BOUNDARY}`)
	if ('html' in body) {
		lines.push('Content-Type: text/html; charset=utf-8')
		lines.push('Content-Transfer-Encoding: base64', '', encodeBase64(body.html), '')
	} else {
		lines.push('Content-Type: text/plain; charset=utf-8')
		lines.push('Content-Transfer-Encoding: base64', '', encodeBase64(body.plain), '')
	}

	for (const attachment of attachments.inline) {
		lines.push(`--${BOUNDARY}`)
		lines.push(`Content-Type: ${attachment.mimeType}`)
		if (attachment.filename === null) {
			lines.push('Content-Disposition: attachment')
		} else {
			lines.push(`Content-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`)
		}
		lines.push(`Content-ID: <${attachment.contentId}>`)
		lines.push('Content-Transfer-Encoding: base64', '', Buffer.from(attachment.data).toString('base64'), '')
	}
	for (const attachment of attachments.files) {
		lines.push(`--${BOUNDARY}`)
		lines.push('Content-Type: application/octet-stream')
		if (attachment.filename === null) {
			lines.push('Content-Disposition: attachment')
		} else {
			lines.push(`Content-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`)
		}
		lines.push('Content-Transfer-Encoding: base64', '', '', '')
	}
	lines.push(`--${BOUNDARY}--`, '')

	const source = lines.join('\r\n')
	return new TextEncoder().encode(source).buffer
}

/**
 * @param address extracted address
 */
function toHeaderAddress(address: MailAddress): string {
	const parts: string[] = []
	if (address.name !== null) {
		parts.push(encodeWord(address.name))
	}
	if (address.address !== null) {
		parts.push(`<${address.address}>`)
	}
	return parts.join(' ')
}

/**
 * @param text header text
 * @return the text as RFC 2047 encoded word
 */
function encodeWord(text: string): string {
	return `=?UTF-8?B?${encodeBase64(text)}?=`
}

/**
 * @param text text
 * @return the text as UTF-8, base64 encoded
 */
function encodeBase64(text: string): string {
	return Buffer.from(text).toString('base64')
}
