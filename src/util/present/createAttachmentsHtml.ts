/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * The list of the attachments that are not shown in the body, after the body of the email.
 * Like the header, it only has inline styles, see createHeaderHtml.ts.
 */

import type { FileMailAttachment, InlineMailAttachment } from '../../model/ExtractedEmail.ts'

import { translate as t } from '@nextcloud/l10n'

/**
 * @param document document to create the list in
 * @param files file attachments
 * @param unusedInline inline attachments that are not used in the body
 * @return list with a title
 */
export function createAttachmentsHtml(document: Document, files: FileMailAttachment[], unusedInline: InlineMailAttachment[]): HTMLElement {
	const footer = document.createElement('div')
	footer.style.fontFamily = 'sans-serif'
	footer.style.fontSize = '14px'
	footer.style.borderTop = '1px solid #cccccc'
	footer.style.padding = '8px 16px'
	// not inherited from the page
	footer.style.color = '#000000'
	footer.style.backgroundColor = '#ffffff'
	footer.style.textAlign = 'left'
	footer.style.lineHeight = 'normal'

	const title = document.createElement('div')
	title.style.fontSize = '16px'
	title.style.fontWeight = 'bold'
	title.style.margin = '8px 0'
	title.textContent = t('files_emailviewer', 'Attachments')
	footer.append(title)

	const list = document.createElement('ul')
	list.style.margin = '0'
	list.style.padding = '0'
	for (const file of files) {
		// TRANSLATORS shown in the list of attachments in place of the file name of an attachment that has none
		list.append(createItem(document, file.filename ?? t('files_emailviewer', 'unnamed')))
	}
	for (const attachment of unusedInline) {
		list.append(createItem(document, attachment.filename ?? attachment.contentId))
	}
	footer.append(list)

	return footer
}

/**
 * @param document document to create the item in
 * @param name name of the attachment
 */
function createItem(document: Document, name: string): HTMLElement {
	const item = document.createElement('li')
	item.style.listStyle = 'disc inside'
	item.style.padding = '2px 0 2px 16px'
	item.textContent = name
	return item
}
