/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * Generates src/util/extract/codepages.json, an array that maps Windows code page identifiers to the encoding names of iconv-lite,
 * like `{ "codepage": 1251, "iconvName": "windows1251" }`.
 * Code pages that only TextDecoder supports have an empty iconvName and a label for TextDecoder instead,
 * like `{ "codepage": 50220, "iconvName": "", "textDecoderLabel": "iso-2022-jp" }`.
 *
 * Usage: node generateCodepageMapping.mts
 *
 * Sources:
 * - the code page identifiers, with their .NET name, from the Microsoft documentation
 * - the encodings of iconv-lite, which msgreader uses
 *
 * Only code pages that iconv-lite or TextDecoder supports are included.
 */

// @ts-expect-error iconv-lite has no types for its table of encodings
import iconvEncodingTable from 'iconv-lite/encodings/index.js'
import { writeFile } from 'node:fs/promises'

const OUTPUT_FILE = new URL('src/util/extract/codepages.json', import.meta.url)
const CODE_PAGE_IDENTIFIERS_URL = 'https://raw.githubusercontent.com/MicrosoftDocs/win32/docs/desktop-src/Intl/code-page-identifiers.md'

/** names of the encodings of iconv-lite, with their definition or the name they are an alias of */
const encodings = iconvEncodingTable as Record<string, unknown>

/** encodings of iconv-lite for code pages that it does not know by their identifier or .NET name, knows less exactly, or that are decoded leniently */
const ICONV_NAME_OVERRIDES = new Map<number, string>([
	// `utf16` detects the byte order from a byte order mark, but 1200 is always little endian
	[1200, 'utf16le'],
	// unicodeFFFE
	[1201, 'utf16be'],
	// `utf32` detects the byte order from a byte order mark, but 12000 is always little endian
	[12000, 'utf32le'],
	// x-mac-romanian
	[10010, 'macromania'],
	// x-mac-ukrainian
	[10017, 'macukraine'],
	// x-mac-thai
	[10021, 'macthai'],
	// x-mac-croatian
	[10082, 'maccroatian'],
	// us-ascii and iso-8859-1 as their superset windows-1252, and iso-8859-9 as its superset windows-1254,
	// like browsers and mail clients do for mislabelled mail
	[20127, 'windows1252'],
	[28591, 'windows1252'],
	[28599, 'windows1254'],
	// x-cp20936, GB2312, which is a subset of cp936
	[20936, 'gb2312'],
	// iso-8859-8-i, which only differs from iso-8859-8 in the order of right-to-left text, not in the bytes
	[38598, 'iso88598'],
])

/** labels of TextDecoder for code pages that iconv-lite does not support */
const TEXT_DECODER_LABELS = new Map<number, string>([
	// iso-2022-jp, csISO2022JP and iso-2022-jp with SO/SI, which the ISO-2022-JP decoder of the Encoding Standard all decodes
	[50220, 'iso-2022-jp'],
	[50221, 'iso-2022-jp'],
	[50222, 'iso-2022-jp'],
])

/**
 * Follows the aliases of iconv-lite, like it does in getCodec().
 *
 * @param encoding any name of an encoding
 * @return the name the aliases lead to, null if iconv-lite does not know the encoding
 */
function resolveIconvName(encoding: string): string | null {
	// iconv-lite names encodings in lower case and only with letters and digits, like `windows1251` for `Windows-1251`
	let name = encoding.toLowerCase().replace(/[^0-9a-z]/g, '')
	let definition = encodings[name]
	while (typeof definition === 'string') {
		name = definition
		definition = encodings[name]
	}
	return definition === undefined ? null : name
}

/**
 * After the overrides, the identifier is tried first, as the .NET name can be a different encoding in iconv-lite.
 * iconv-lite knows some code pages only with the `cp` prefix, like `cp720` for DOS-720.
 *
 * @param codepage Windows code page identifier
 * @param netName .NET name of the code page, empty if there is none
 */
function findIconvName(codepage: string, netName: string): string | null {
	const override = ICONV_NAME_OVERRIDES.get(Number(codepage))
	if (override !== undefined) {
		const name = resolveIconvName(override)
		if (name === null) {
			throw new Error(`iconv-lite does not know the override ${override} for code page ${codepage}`)
		}
		return name
	}
	for (const candidate of [codepage, `cp${codepage}`, netName]) {
		const name = resolveIconvName(candidate)
		if (name !== null) {
			return name
		}
	}
	return null
}

const response = await fetch(CODE_PAGE_IDENTIFIERS_URL)
if (!response.ok) {
	throw new Error(`Fetching ${CODE_PAGE_IDENTIFIERS_URL} failed with status ${response.status}`)
}
const markdown = await response.text()

const codepages: { codepage: number, iconvName: string, textDecoderLabel?: string }[] = []
for (const line of markdown.split('\n')) {
	// rows of the table look like `| 037 | IBM037 | IBM EBCDIC US-Canada |`
	if (!line.startsWith('|') || !line.endsWith('|')) {
		continue
	}
	const [codepage, netName] = line.slice(1, -1).split('|').map((cell) => cell.trim())
	// the header and the separator row
	if (!/^\d+$/.test(codepage!)) {
		continue
	}
	const textDecoderLabel = TEXT_DECODER_LABELS.get(Number(codepage))
	if (textDecoderLabel !== undefined) {
		// throws if TextDecoder does not support the label
		new TextDecoder(textDecoderLabel)
		codepages.push({ codepage: Number(codepage), iconvName: '', textDecoderLabel })
		continue
	}
	// without Markdown escapes like `shift\_jis`
	const unescapedNetName = netName!.replace(/\\(.)/g, '$1')
	const iconvName = findIconvName(codepage!, unescapedNetName)
	if (iconvName !== null) {
		codepages.push({ codepage: Number(codepage), iconvName })
	}
}

await writeFile(OUTPUT_FILE, JSON.stringify(codepages, null, '\t') + '\n')
// eslint-disable-next-line no-console
console.log(`Wrote ${OUTPUT_FILE.pathname}: ${codepages.length} code pages`)
