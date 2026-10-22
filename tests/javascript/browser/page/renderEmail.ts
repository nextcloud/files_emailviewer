/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { convertMailToPdf } from '../../../../src/util/convert.ts'

/** result of extracting and rendering, as strings, as it is passed to Node.js */
export interface RenderResult {
	/** PDF as base64, null if extracting or rendering failed */
	pdf: string | null
	/** error with its causes, null if nothing failed */
	error: string | null
}

declare global {
	interface Window {
		/**
		 * @param mail `.eml` or `.msg` file as base64
		 * @param mime mime type of the file
		 * @return result, also if something failed
		 */
		renderEmail: (mail: string, mime: string) => Promise<RenderResult>
	}
}

window.renderEmail = renderEmail

/**
 * @param mail `.eml` or `.msg` file as base64
 * @param mime mime type of the file
 * @return result, also if something failed
 */
async function renderEmail(mail: string, mime: string): Promise<RenderResult> {
	try {
		const data = fromBase64(mail).buffer as ArrayBuffer
		const pdf = await convertMailToPdf(data, mime)
		return { pdf: await toBase64(pdf), error: null }
	} catch (error) {
		return { pdf: null, error: describeError(error) }
	}
}

/**
 * @param error thrown value
 * @return the error with its stack and its causes
 */
function describeError(error: unknown): string {
	if (!(error instanceof Error)) {
		return String(error)
	}
	let description = error.stack ?? `${error.name}: ${error.message}`
	if (!description.includes(error.message)) {
		description = `${error.name}: ${error.message}\n${description}`
	}
	if (error.cause !== undefined) {
		description += `\nCaused by: ${describeError(error.cause)}`
	}
	return description
}

/**
 * @param base64 base64 text
 */
function fromBase64(base64: string): Uint8Array {
	const binary = atob(base64)
	const data = new Uint8Array(binary.length)
	for (let index = 0; index < binary.length; index++) {
		data[index] = binary.charCodeAt(index)
	}
	return data
}

/**
 * @param blob binary data
 * @return the data as base64, without the `data:` prefix
 */
function toBase64(blob: Blob): Promise<string> {
	return new Promise(function read(resolve, reject) {
		const reader = new FileReader()
		reader.addEventListener('load', function resolveBase64() {
			const dataUrl = reader.result as string
			resolve(dataUrl.slice(dataUrl.indexOf(',') + 1))
		})
		reader.addEventListener('error', function rejectWithError() {
			reject(new Error('Reading the PDF failed', { cause: reader.error }))
		})
		reader.readAsDataURL(blob)
	})
}
