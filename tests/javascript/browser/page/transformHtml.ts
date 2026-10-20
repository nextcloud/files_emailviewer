/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { InlineAttachmentInput } from '../../transformFixtureLoading.ts'

import { sanitizeHtml } from '../../../../src/util/transform/index.ts'

/** result of sanitizing, as it is passed to Node.js */
export interface TransformResult {
	html: string
	/** content IDs of the inline attachments that the sanitized HTML does not show */
	unusedInline: string[]
}

declare global {
	interface Window {
		/**
		 * @param html untrusted HTML
		 * @param inline inline attachments with their content as base64
		 */
		transformHtml: (html: string, inline: InlineAttachmentInput[]) => TransformResult
	}
}

window.transformHtml = transformHtml

/**
 * @param html untrusted HTML
 * @param inline inline attachments with their content as base64
 */
function transformHtml(html: string, inline: InlineAttachmentInput[]): TransformResult {
	const attachments = inline.map(function toAttachment(attachment) {
		return { contentId: attachment.contentId, filename: null, mimeType: attachment.mimeType, data: fromBase64(attachment.data) }
	})
	const sanitized = sanitizeHtml(html, attachments)
	const container = document.createElement('div')
	container.append(sanitized.content)
	return {
		html: container.innerHTML,
		unusedInline: sanitized.unusedInline.map((attachment) => attachment.contentId),
	}
}

/**
 * @param base64 base64 text
 */
function fromBase64(base64: string): Uint8Array {
	const binary = atob(base64)
	const data = new Uint8Array(binary.length)
	for (let index = 0; index < binary.length; index++) {
		data[index] = binary.charCodeAt(index)
	}
	return data
}
