/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * Smoke test helper: extracts an `.eml` test case and writes the result as `.msg` file,
 * so that the `.eml` test cases also run for the `.msg` extraction.
 *
 * This is not a general conversion, it is only useful for smoke testing with the existing test cases.
 */

import type { MailAddress } from '../../src/model/ExtractedEmail.ts'

import { Attachment, CFB, Email } from '@tutao/oxmsg'
import { EML_MIME_TYPE } from '../../src/model/MimeType.ts'
import { extractEmail } from '../../src/util/extract/index.ts'

/**
 * Property tag of the sent date (PidTagClientSubmitTime): property ID 0x0039 and type 0x0040 (PT_SYSTIME)
 *
 * @see https://learn.microsoft.com/en-us/office/client-developer/outlook/mapi/pidtagclientsubmittime-canonical-property
 */
const PR_CLIENT_SUBMIT_TIME = 0x00390040

/** streams of the display name, extension, short and long file name of an attachment, as Unicode strings */
const FILE_NAME_STREAMS = ['__substg1.0_3001001F', '__substg1.0_3703001F', '__substg1.0_3704001F', '__substg1.0_3707001F']

/**
 * @param eml `.eml` file content
 */
export async function emlToMsg(eml: ArrayBuffer): Promise<ArrayBuffer> {
	const { body, metadata, attachments } = await extractEmail(eml, EML_MIME_TYPE)
	const msg = new Email()

	if (metadata.subject !== null) {
		msg.subject(metadata.subject)
	}
	if (metadata.from !== null) {
		const sender = toMsgAddress(metadata.from)
		msg.sender(sender.address, sender.name)
	}
	for (const recipient of metadata.to.map(toMsgAddress)) {
		msg.to(recipient.address, recipient.name)
	}
	for (const recipient of metadata.cc.map(toMsgAddress)) {
		msg.cc(recipient.address, recipient.name)
	}
	if (metadata.sentDate !== null) {
		msg.sentOn(metadata.sentDate)
	}

	if ('html' in body) {
		msg.bodyHtml(body.html)
	} else {
		msg.bodyText(body.plain)
	}

	// indexes of the attachments whose file name is only a placeholder
	const unnamed: number[] = []
	for (const [index, attachment] of attachments.inline.entries()) {
		// oxmsg derives the mime type from the file name, and only writes the content ID with a file name
		if (attachment.filename === null) {
			unnamed.push(index)
		}
		const fileName = attachment.filename ?? `inline.${attachment.mimeType.split('/')[1]}`
		msg.attach(new Attachment(attachment.data, fileName, attachment.contentId))
	}
	for (const attachment of attachments.files) {
		msg.attach(new Attachment(new Uint8Array(0), attachment.filename ?? ''))
	}

	const cfb = CFB.read(msg.msg(), { type: 'array' })
	if (metadata.sentDate === null) {
		removeSentDate(cfb)
	}
	for (const index of unnamed) {
		removeFileName(cfb, index)
	}
	const written = CFB.write(cfb, { type: 'array' })
	return new Uint8Array(written).buffer
}

/**
 * @param address extracted address
 * @return the address and display name for oxmsg, with the name as address if there is no address
 */
function toMsgAddress(address: MailAddress): { address: string, name: string | undefined } {
	if (address.address === null) {
		return { address: address.name ?? '', name: undefined }
	}
	if (address.name === null) {
		return { address: address.address, name: undefined }
	}
	return { address: address.address, name: address.name }
}

/**
 * oxmsg always sets the sent date.
 *
 * @param cfb `.msg` file content, changed in place
 */
function removeSentDate(cfb: CFB.CFB$Container): void {
	const entry = CFB.find(cfb, '__properties_version1.0')!
	const properties = Uint8Array.from(entry.content)

	// 32 byte header, followed by 16 byte properties starting with the property tag
	const kept = [...properties.slice(0, 32)]
	for (let offset = 32; offset < properties.length; offset += 16) {
		const tag = new DataView(properties.buffer, offset, 4).getUint32(0, true)
		if (tag !== PR_CLIENT_SUBMIT_TIME) {
			kept.push(...properties.slice(offset, offset + 16))
		}
	}
	entry.content = Uint8Array.from(kept)
	entry.size = kept.length
}

/**
 * Empties the file name streams, as oxmsg needs a file name to write the content ID and mime type.
 *
 * @param cfb `.msg` file content, changed in place
 * @param index index of the attachment
 */
function removeFileName(cfb: CFB.CFB$Container, index: number): void {
	const storage = `Root Entry/__attach_version1.0_#${index.toString(16).toUpperCase().padStart(8, '0')}`
	for (const stream of FILE_NAME_STREAMS) {
		const entry = CFB.find(cfb, `${storage}/${stream}`)!
		entry.content = new Uint8Array(0)
		entry.size = 0
	}
}
