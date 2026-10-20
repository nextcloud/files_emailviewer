/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EML_MIME_TYPE, MSG_MIME_TYPE } from '../../src/model/MimeType.ts'

// CommonJS, as the package is not of type module
const EXAMPLES_DIRECTORY = join(__dirname, '../fixtures/rendering-examples')

const EXTENSIONS = ['.eml', '.msg', '.html']

export interface RenderingCase {
	file: string
	path: string
}

/**
 * Synchronous, as Playwright needs the tests when loading the test file.
 */
export function listRenderingCases(): RenderingCase[] {
	const cases: RenderingCase[] = []
	for (const file of readdirSync(EXAMPLES_DIRECTORY)) {
		if (EXTENSIONS.some((extension) => file.endsWith(extension))) {
			cases.push({ file, path: join(EXAMPLES_DIRECTORY, file) })
		}
	}
	return cases
}

/**
 * @param renderingCase case to load
 * @return `.eml` or `.msg` file content, and its mime type
 */
export async function loadMail({ file, path }: RenderingCase): Promise<{ mail: Buffer, mime: string }> {
	const content = await readFile(path)
	if (file.endsWith('.msg')) {
		return { mail: content, mime: MSG_MIME_TYPE }
	}
	if (file.endsWith('.eml')) {
		return { mail: content, mime: EML_MIME_TYPE }
	}
	const headers = 'From: Sender <sender@example.com>\r\n'
		+ 'To: Bob <bob@example.com>\r\n'
		+ `Subject: ${file}\r\n`
		+ 'Date: Thu, 01 Oct 2026 10:00:00 +0200\r\n'
		+ 'MIME-Version: 1.0\r\n'
		+ 'Content-Type: text/html; charset=utf-8\r\n'
		+ 'Content-Transfer-Encoding: 8bit\r\n'
		+ '\r\n'
	return { mail: Buffer.concat([Buffer.from(headers), content]), mime: EML_MIME_TYPE }
}
