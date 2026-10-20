/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * Creates the element that the render page draws into the PDF, see src/util/render.ts:
 * the body of the sanitized email, with the header with the metadata before,
 * and the list of the attachments that are not shown in the body after.
 * The email has only inline styles, so they do not apply to the header and the list.
 */

import type { SanitizedEmail } from '../../model/SanitizedEmail.ts'

import { createAttachmentsHtml } from './createAttachmentsHtml.ts'
import { createHeaderHtml } from './createHeaderHtml.ts'

/**
 * Created in a document without a browsing context, so that nothing of the email loads in the app.
 *
 * @param email sanitized email
 * @return element with the header, the body and the list of the attachments
 */
export function createEmailElement(email: SanitizedEmail): HTMLElement {
	const document = window.document.implementation.createHTMLDocument('')
	const container = document.createElement('div')
	if ('content' in email.body) {
		container.append(email.body.content)
	} else {
		appendPlainText(container, email.body.plain)
	}

	const header = createHeaderHtml(document, email.metadata)
	header.style.marginBottom = '24px'
	container.prepend(header)
	const unusedInline = email.attachments.unusedInline
	if (email.attachments.files.length > 0 || unusedInline.length > 0) {
		const list = createAttachmentsHtml(document, email.attachments.files, unusedInline)
		list.style.marginTop = '16px'
		container.append(list)
	}
	return container
}

/**
 * @param container container of the email
 * @param text plain text body
 */
function appendPlainText(container: HTMLElement, text: string): void {
	const plain = container.ownerDocument.createElement('div')
	plain.style.whiteSpace = 'pre-wrap'
	plain.textContent = text
	container.append(plain)
}
