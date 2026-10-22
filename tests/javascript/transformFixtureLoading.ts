/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'

// CommonJS, as the package is not of type module
const FIXTURES_DIRECTORY = join(__dirname, '../fixtures')

const transformCasesSchema = z.array(z.strictObject({
	description: z.string().min(1),
	raw: z.string(),
	inline: z.array(z.strictObject({
		contentId: z.string(),
		mimeType: z.string(),
		data: z.base64(),
	})).optional(),
	sanitized: z.string(),
	unusedInline: z.array(z.string()).optional(),
}))

/** inline attachment as it is passed to the browser */
export interface InlineAttachmentInput {
	contentId: string
	mimeType: string
	/** content as base64 */
	data: string
}

export interface TransformCase {
	description: string
	raw: string
	/** inline attachments, whose `cid:` URLs are replaced */
	inline: InlineAttachmentInput[]
	sanitized: string
	/** content IDs of the inline attachments that the sanitized HTML does not show */
	unusedInline: string[]
}

/**
 * Synchronous, as Playwright needs the tests when loading the test file.
 *
 * @param name file name in `tests/fixtures`, like `transform/sanitization.yaml`
 */
export function loadTransformCases(name: string): TransformCase[] {
	const content = readFileSync(join(FIXTURES_DIRECTORY, name), 'utf-8')
	const inputs = transformCasesSchema.parse(parse(content))

	return inputs.map((input) => ({
		description: input.description,
		raw: input.raw,
		inline: input.inline ?? [],
		sanitized: input.sanitized,
		unusedInline: input.unusedInline ?? [],
	}))
}
