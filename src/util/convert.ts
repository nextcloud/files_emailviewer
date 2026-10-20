/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RenderPageWindow } from '../model/RenderPage.ts'

import { generateUrl } from '@nextcloud/router'
import { extractEmail } from './extract/index.ts'
import { createEmailElement } from './present/createEmailElement.ts'
import { sanitizeEmail } from './transform/index.ts'

/**
 * Extracts and sanitizes the email, puts it together with the header and the list of the attachments,
 * and renders it in the render page, see src/render-frame.ts.
 *
 * @param mail `.eml` or `.msg` file
 * @param mimeType mime type of the file
 * @return the PDF
 */
export async function convertMailToPdf(mail: ArrayBuffer, mimeType: string): Promise<Blob> {
	const extracted = await extractEmail(mail, mimeType)
	const sanitized = sanitizeEmail(extracted)
	const element = createEmailElement(sanitized)
	return renderMailAsPdf(element)
}

/**
 * Loads the render page in a frame, which is removed afterwards, and lets it render the email.
 *
 * @param element element of the email
 * @return the PDF
 */
async function renderMailAsPdf(element: HTMLElement): Promise<Blob> {
	const frame = createRenderFrame()
	try {
		const loaded = new Promise<void>(function waitForLoad(resolve) {
			frame.addEventListener('load', () => resolve(), { once: true })
		})
		document.body.append(frame)
		await loaded

		const renderPageWindow = frame.contentWindow as RenderPageWindow | null
		const renderEmailPdf = renderPageWindow?.renderEmailPdf
		if (renderEmailPdf === undefined) {
			throw new Error('The render page did not load its script')
		}
		return await renderEmailPdf(element)
	} catch (error) {
		throw new Error('Rendering the email failed in the render page', { cause: error })
	} finally {
		frame.remove()
	}
}

/**
 * Create iFrame with strict CSP for running rendering script inside.
 *
 * @return invisible frame of the render page, not appended yet
 */
function createRenderFrame(): HTMLIFrameElement {
	const frame = document.createElement('iframe')
	frame.sandbox.add('allow-scripts')
	frame.sandbox.add('allow-same-origin')
	frame.src = generateUrl('/apps/files_emailviewer/render-frame-page')
	frame.style.visibility = 'hidden'
	frame.style.position = 'fixed'
	frame.style.left = '-10000px'
	frame.style.top = '0'
	frame.style.border = '0'
	return frame
}
