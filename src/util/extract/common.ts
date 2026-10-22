/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { MailAddress, MailBody } from '../../model/ExtractedEmail.ts'

import { MailProcessingError } from '../../model/MailProcessingError.ts'

/**
 * @param html HTML body
 * @param plain plain text body
 * @return the HTML body, or the plain text body if there is no HTML body
 * @throws {MailProcessingError}
 */
export function toMailBody(html: string | undefined, plain: string | undefined): MailBody {
	const nonEmptyHtml = nonEmptyOrNull(html)
	if (nonEmptyHtml !== null) {
		return { html: normalizeLineEndings(nonEmptyHtml) }
	}
	const nonEmptyPlain = nonEmptyOrNull(plain)
	if (nonEmptyPlain !== null) {
		return { plain: normalizeLineEndings(nonEmptyPlain) }
	}
	throw new MailProcessingError('Email has neither an HTML nor a plain text body')
}

/**
 * postal-mime already converts the line endings of `.eml` bodies, msgreader keeps them,
 * so that the body is the same for both formats.
 *
 * @param text body text
 * @return the text with `\r\n` line endings replaced by `\n`
 */
function normalizeLineEndings(text: string): string {
	return text.replaceAll('\r\n', '\n')
}

/**
 * @param name display name
 * @param address email address, or something else like an Exchange address
 * @return the address, with a display name that is only the address itself replaced by null
 */
export function toMailAddress(name: string | undefined, address: string): MailAddress {
	let displayName = nonEmptyOrNull(name)
	if (displayName === address) {
		displayName = null
	}

	if (address === '') {
		return { name: displayName, address: null }
	}
	// not a real email address, like an Exchange address, so it is only kept for display
	if (!address.includes('@')) {
		if (displayName === null) {
			return { name: address, address: null }
		}
		return { name: `${displayName} ${address}`, address: null }
	}
	return { name: displayName, address }
}

/**
 * @param contentId Content-ID, with or without angle brackets
 * @return the Content-ID without angle brackets, or null if there is none
 */
export function toContentId(contentId: string | undefined): string | null {
	return nonEmptyOrNull(contentId?.replace(/^<|>$/g, ''))
}

/**
 * @param date date string
 */
export function toDate(date: string | undefined): Date | null {
	if (date === undefined) {
		return null
	}

	const parsed = new Date(date)
	if (parsed.toString() === 'Invalid Date') {
		return null
	}
	return parsed
}

/**
 * @param value value
 * @return the value, or null if it is undefined, null or empty
 */
export function nonEmptyOrNull(value: string | null | undefined): string | null {
	if (value === undefined || value === null || value === '') {
		return null
	}
	return value
}
