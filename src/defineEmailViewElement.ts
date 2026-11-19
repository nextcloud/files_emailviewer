/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineCustomElement } from 'vue'
import EmailView from './views/EmailView.vue'

/** name of the custom element of src/views/EmailView.vue */
export const EMAIL_VIEW_ELEMENT_NAME = 'files_emailviewer-email-view'

// Without a shadow root, so that the styles of Nextcloud apply inside.
if (window.customElements.get(EMAIL_VIEW_ELEMENT_NAME) === undefined) {
	window.customElements.define(EMAIL_VIEW_ELEMENT_NAME, defineCustomElement(EmailView, { shadowRoot: false }))
}
