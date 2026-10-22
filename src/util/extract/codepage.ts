/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * Decodes text in a Windows code page, as `.msg` files store it, like the HTML body and non-Unicode string properties.
 *
 * The code pages are decoded with iconv-lite, which msgreader already uses, or with TextDecoder for the few that only it supports.
 * codepages.json maps the code pages to their encoding, see generateCodepageMapping.mts.
 *
 * @see https://learn.microsoft.com/en-us/windows/win32/intl/code-page-identifiers
 */

import { getLcidToAnsiCodePages } from '@kenjiuno/msgreader/lib/Defs.js'
import { Buffer } from 'buffer'
import iconv from 'iconv-lite'
import CODEPAGES from './codepages.json'

const CODEPAGES_BY_ID = new Map(CODEPAGES.map((entry) => [entry.codepage, entry]))
const ANSI_CODEPAGES_BY_LCID = getLcidToAnsiCodePages()

/**
 * @param codepage Windows code page identifier, undefined if there is none
 * @return name of the encoding in iconv-lite, null if the code page is missing or iconv-lite does not support it
 */
export function toIconvName(codepage: number | undefined): string | null {
	const entry = codepage === undefined ? undefined : CODEPAGES_BY_ID.get(codepage)
	// the code pages that only TextDecoder supports have an empty name
	return entry?.iconvName || null
}

/**
 * @param lcid Windows locale identifier, undefined if there is none
 * @return the ANSI code page of the locale, like 932 for Japanese, undefined if it is not known
 */
export function toAnsiCodepage(lcid: number | undefined): number | undefined {
	return lcid === undefined ? undefined : ANSI_CODEPAGES_BY_LCID[lcid]?.[0]
}

/**
 * @param data encoded text
 * @param codepage Windows code page identifier, undefined if there is none
 * @return the text, decoded as UTF-8 if the code page is missing or not supported
 */
export function decodeCodepage(data: Uint8Array, codepage: number | undefined): string {
	const decode = createDecoder(codepage)
	return decode === null ? new TextDecoder().decode(data) : decode(data)
}

/**
 * @param codepage Windows code page identifier, undefined if there is none
 * @return function that decodes text in the code page, null if the code page is missing or not supported
 */
function createDecoder(codepage: number | undefined): ((data: Uint8Array) => string) | null {
	const entry = codepage === undefined ? undefined : CODEPAGES_BY_ID.get(codepage)
	if (entry === undefined) {
		return null
	}
	if (entry.textDecoderLabel !== undefined) {
		const decoder = new TextDecoder(entry.textDecoderLabel)
		return (data) => decoder.decode(data)
	}
	return (data) => iconv.decode(Buffer.from(data.buffer, data.byteOffset, data.byteLength), entry.iconvName)
}
