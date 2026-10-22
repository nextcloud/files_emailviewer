/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RenderPageWindow } from './model/RenderPage.ts'

import { createEmailFrame, renderPdf } from './util/render.ts'

const renderPageWindow = window as RenderPageWindow
renderPageWindow.renderEmailPdf = renderEmailPdf

/**
 * Appends the email to a frame that is sandboxed without scripts, and renders it as PDF.
 *
 * @param element element of the email, see src/util/present/createEmailElement.ts
 * @return the PDF
 */
async function renderEmailPdf(element: HTMLElement): Promise<Blob> {
	const emailFrame = await createEmailFrame()
	emailFrame.contentDocument!.body.append(element)
	return renderPdf(element)
}
