/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/*
 * The header with the metadata, before the body of the email.
 * It only has inline styles, like the email, as the render page has no style sheets.
 */

import type { MailAddress, MailMetadata } from '../../model/ExtractedEmail.ts'

import { getCanonicalLocale, translate as t } from '@nextcloud/l10n'

/**
 * @param document document to create the header in
 * @param metadata metadata of the email
 * @return box with a table of the metadata
 */
export function createHeaderHtml(document: Document, metadata: MailMetadata): HTMLElement {
	const header = document.createElement('div')
	header.style.fontFamily = 'sans-serif'
	header.style.fontSize = '14px'
	header.style.border = '1px solid #dddddd'
	header.style.padding = '8px 16px'
	// not inherited from the page
	header.style.color = '#000000'
	header.style.backgroundColor = '#ffffff'
	header.style.textAlign = 'left'
	header.style.lineHeight = 'normal'

	const table = document.createElement('table')
	table.style.borderCollapse = 'collapse'
	if (metadata.from !== null) {
		table.append(createRow(document, t('files_emailviewer', 'From'), formatAddress(metadata.from), false))
	}
	table.append(createRow(document, t('files_emailviewer', 'Subject'), metadata.subject ?? t('files_emailviewer', '(no subject)'), true))
	if (metadata.to.length > 0) {
		table.append(createRow(document, t('files_emailviewer', 'To'), metadata.to.map(formatAddress).join(', '), false))
	}
	if (metadata.cc.length > 0) {
		table.append(createRow(document, t('files_emailviewer', 'Cc'), metadata.cc.map(formatAddress).join(', '), false))
	}
	if (metadata.sentDate !== null) {
		const date = metadata.sentDate.toLocaleString(getCanonicalLocale(), { dateStyle: 'long', timeStyle: 'long' })
		table.append(createRow(document, t('files_emailviewer', 'Date'), date, false))
	}
	header.append(table)

	return header
}

/**
 * @param document document to create the row in
 * @param label label of the value
 * @param value text of the value
 * @param bold whether the value is bold, like the subject
 */
function createRow(document: Document, label: string, value: string, bold: boolean): HTMLElement {
	const row = document.createElement('tr')

	const labelCell = document.createElement('td')
	labelCell.style.textAlign = 'right'
	labelCell.style.verticalAlign = 'top'
	labelCell.style.color = '#888888'
	labelCell.style.padding = '2px 8px 2px 0'
	labelCell.style.whiteSpace = 'nowrap'
	labelCell.textContent = label
	row.append(labelCell)

	const valueCell = document.createElement('td')
	valueCell.style.padding = '2px 0'
	if (bold) {
		valueCell.style.fontWeight = 'bold'
	}
	valueCell.textContent = value
	row.append(valueCell)

	return row
}

/**
 * @param address address of a sender or recipient
 * @return like `Alice <alice@example.com>`
 */
function formatAddress(address: MailAddress): string {
	if (address.name !== null && address.address !== null) {
		return `${address.name} <${address.address}>`
	}
	return address.name ?? address.address ?? ''
}
