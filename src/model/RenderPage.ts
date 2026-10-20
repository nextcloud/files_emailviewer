/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * What the render page, see src/render-frame.ts, offers to the app, see src/util/convert.ts.
 * The page has the origin of the app, so the app calls it directly.
 */
export interface RenderPageWindow extends Window {
	/**
	 * Appends the email to a frame that is sandboxed without scripts, and renders it.
	 * Set by the script of the page, so before the page is loaded.
	 *
	 * @param element element of the email, see src/util/present/createEmailElement.ts
	 * @return the PDF
	 */
	renderEmailPdf?(element: HTMLElement): Promise<Blob>
}
