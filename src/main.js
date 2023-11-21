/**
 * @copyright Copyright (c) 2023 Daniel Kesselberg <mail@danielkesselberg.de>
 *
 * @author Daniel Kesselberg <mail@danielkesselberg.de>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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
