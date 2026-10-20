/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { UponSanitizeAttributeHookEvent } from 'dompurify'

/** links that the PDF may contain */
const LINK_URL = /^(?:https?|mailto):/i

/**
 * Keeps only links to web pages and email addresses.
 *
 * @param element element of the attribute
 * @param attribute attribute before the checks of DOMPurify
 */
export function sanitizeLink(element: Element, attribute: UponSanitizeAttributeHookEvent): void {
	if (attribute.attrName !== 'href') {
		return
	}
	if (element.nodeName !== 'A' || !LINK_URL.test(attribute.attrValue)) {
		attribute.keepAttr = false
	}
}
