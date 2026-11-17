/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { convertMailToPdf } from '../../../../src/util/convert.ts'

/** the package pdfjs-dist, as served by the development server */
const PDFJS_URL = '/pdfjs-dist'

/** pixels per point of the PDF, for the images of the pages */
const PAGE_SCALE = 1

/** pixels between the pages in the image */
const PAGE_GAP = 8

/** color between the pages in the image, distinct from white page backgrounds */
const PAGE_GAP_COLOR = '#808080'

GlobalWorkerOptions.workerSrc = `${PDFJS_URL}/build/pdf.worker.min.mjs`

/** result of extracting and rendering, as strings, as it is passed to Node.js */
export interface RenderResult {
	/** PNG image of the pages of the PDF below each other as base64, null if extracting or rendering failed */
	image: string | null
	/** text of the PDF with a header before each page, null if extracting or rendering failed */
	text: string | null
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
		return { ...await inspectPdf(pdf), error: null }
	} catch (error) {
		return { image: null, text: null, error: describeError(error) }
	}
}

/**
 * Draws the pages below each other as one image and extracts the text,
 * so that differences of the PDF can be previewed as image and text diffs.
 *
 * @param pdf the PDF
 * @return PNG image of the pages as base64, and the text
 */
async function inspectPdf(pdf: Blob): Promise<{ image: string, text: string }> {
	const loadingTask = getDocument({
		// not `pdf.arrayBuffer()`, as its promise belongs to the removed render frame and never settles
		data: new Uint8Array(await new Response(pdf).arrayBuffer()),
		standardFontDataUrl: `${PDFJS_URL}/standard_fonts/`,
	})
	try {
		const pdfDocument = await loadingTask.promise
		const pages: HTMLCanvasElement[] = []
		let text = ''
		for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
			const page = await pdfDocument.getPage(pageNumber)
			const viewport = page.getViewport({ scale: PAGE_SCALE })
			const canvas = document.createElement('canvas')
			canvas.width = Math.ceil(viewport.width)
			canvas.height = Math.ceil(viewport.height)
			await page.render({ canvas, viewport }).promise
			pages.push(canvas)

			const content = await page.getTextContent()
			text += `--- page ${pageNumber} ---\n`
			for (const item of content.items) {
				if ('str' in item) {
					text += item.str + (item.hasEOL ? '\n' : '')
				}
			}
			text += '\n'
		}
		return { image: await toBase64(await toPngBlob(stackPages(pages))), text }
	} finally {
		await loadingTask.destroy()
	}
}

/**
 * @param pages image of each page
 * @return the pages below each other, separated by gaps
 */
function stackPages(pages: HTMLCanvasElement[]): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = Math.max(...pages.map((page) => page.width))
	canvas.height = pages.reduce((height, page) => height + page.height, 0) + PAGE_GAP * (pages.length - 1)
	const context = canvas.getContext('2d')!
	context.fillStyle = PAGE_GAP_COLOR
	context.fillRect(0, 0, canvas.width, canvas.height)
	let top = 0
	for (const page of pages) {
		context.drawImage(page, 0, top)
		top += page.height + PAGE_GAP
	}
	return canvas
}

/**
 * @param canvas canvas to encode
 * @return the canvas as PNG
 */
function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise(function encode(resolve, reject) {
		canvas.toBlob(function resolveBlob(blob) {
			if (blob === null) {
				reject(new Error('Encoding the page as PNG failed'))
			} else {
				resolve(blob)
			}
		}, 'image/png')
	})
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
			reject(new Error('Reading the blob failed', { cause: reader.error }))
		})
		reader.readAsDataURL(blob)
	})
}
