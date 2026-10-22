/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Config, DOMPurify as Purify } from 'dompurify'
import type { ExtractedEmail, InlineMailAttachment } from '../../model/ExtractedEmail.ts'
import type { SanitizedEmail } from '../../model/SanitizedEmail.ts'

import DOMPurify from 'dompurify'
import { ContentIdResolver, inlineResources } from './inlineResources.ts'
import { sanitizeLink } from './sanitization.ts'

const CONFIG = {
	// no SVG and MathML, which can load resources in many more ways
	USE_PROFILES: { html: true },
	// <form> and <template> are not needed for mail.
	// Don't support <style> to keep it simple.
	// Supporting <style> would require isolating our presentation more from the styles of the email.
	FORBID_TAGS: ['form', 'template', 'style'],
	// Don't support `srcset` to keep the replacement of `cid:` URLs simple, see inlineResources.ts.
	FORBID_ATTR: ['srcset'],
	// any URL in these, so that DOMPurify keeps the `data:` URLs of inline attachments,
	// other URLs are emptied, see inlineResources.ts
	ADD_URI_SAFE_ATTR: ['background', 'poster'],
	// nodes, which the app puts together with the header and the list of the attachments, see createEmailElement.ts
	RETURN_DOM_FRAGMENT: true,
} satisfies Config

export interface SanitizedHtml {
	/** content of the body, with `data:` URLs instead of the `cid:` URLs of the inline attachments */
	content: DocumentFragment
	/** the inline attachments that the HTML does not show */
	unusedInline: InlineMailAttachment[]
}

/**
 * Sanitizes the HTML body, see sanitizeHtml. A plain text body stays as it is, as it is rendered as text.
 *
 * @param email extracted email
 * @return email whose body is safe to render
 */
export function sanitizeEmail(email: ExtractedEmail): SanitizedEmail {
	const files = email.attachments.files
	if (!('html' in email.body)) {
		const unusedInline = email.attachments.inline
		return { body: email.body, metadata: email.metadata, attachments: { files, unusedInline } }
	}
	const sanitized = sanitizeHtml(email.body.html, email.attachments.inline)
	const body = { content: sanitized.content }
	const unusedInline = sanitized.unusedInline
	return { body, metadata: email.metadata, attachments: { files, unusedInline } }
}

/**
 * Removes scripts, `<style>` elements and other active content, and links that are not to web pages or email addresses.
 * Replaces the `cid:` URLs of inline attachments in attributes with `data:` URLs.
 *
 * @param html untrusted HTML of an email
 * @param inline inline attachments, which replace their `cid:` URLs
 * @return content of the body and the inline attachments that it does not show
 */
export function sanitizeHtml(html: string, inline: InlineMailAttachment[]): SanitizedHtml {
	const cidResolver = new ContentIdResolver(inline)
	const content = createPurify(cidResolver).sanitize(html, CONFIG)
	return { content, unusedInline: cidResolver.unused() }
}

/**
 * An own instance for each email, so that its hook has the inline attachments of the email
 * and does not affect other users of DOMPurify.
 *
 * @param cidResolver `data:` URLs of the inline attachments of the email
 */
function createPurify(cidResolver: ContentIdResolver): Purify {
	const purify = DOMPurify()
	purify.addHook('uponSanitizeAttribute', function sanitizeAttribute(element, attribute) {
		sanitizeLink(element, attribute)
		inlineResources(attribute, cidResolver)
	})
	return purify
}
