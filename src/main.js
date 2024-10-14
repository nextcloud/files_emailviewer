/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import EmailView from './views/EmailView.vue'

/**
 * Initialize files_emailviewer
 */
function initEmailViewer() {
	if (!OCA.Viewer) {
		console.debug('cannot register files_emailviewer because OCA.Viewer not found')
		return
	}

	const pdfHandler = OCA.Viewer.availableHandlers.find((handler) => handler.id === 'pdf')
	if (!pdfHandler) {
		console.debug('cannot register files_emailviewer because the pdf handler for OCA.Viewer is unavailable')
		return
	}

	OCA.Viewer.registerHandler({
		id: 'email',

		mimes: [
			'application/vnd.ms-outlook',
			'message/rfc822',
		],

		component: EmailView,

		canCompare: false,
	})
}

initEmailViewer()
