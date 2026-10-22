/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { UponSanitizeAttributeHookEvent } from 'dompurify'
import type { InlineMailAttachment } from '../../model/ExtractedEmail.ts'

const CID_URL = /^cid:/i
/** images that the email contains itself, which load nothing */
const DATA_URL = /^data:/i
/**
 * Attributes whose `cid:` URLs are replaced with the `data:` URLs of the inline attachments, and whose other URLs are emptied.
 * These are the attributes of the HTML profile with URLs of resources. Not `href`, which is a link in the PDF,
 * `action`, whose forms are removed, and `cite`, which loads nothing.
 */
const RESOURCE_ATTRIBUTES = ['background', 'poster', 'src']

/**
 * The `data:` URLs of the inline attachments of one email, created when their `cid:` URLs are replaced.
 * `data:` URLs, which the Content Security Policy of the render page allows, unlike `blob:` URLs.
 */
export class ContentIdResolver {
	private readonly attachments: InlineMailAttachment[]
	private readonly byContentId = new Map<string, InlineMailAttachment>()
	/** `data:` URLs by content ID, of the attachments whose `cid:` URLs were replaced */
	private readonly dataUrls = new Map<string, string>()

	/**
	 * @param attachments inline attachments of the email
	 */
	constructor(attachments: InlineMailAttachment[]) {
		this.attachments = attachments
		for (const attachment of attachments) {
			this.byContentId.set(attachment.contentId, attachment)
		}
	}

	/**
	 * @param url URL of a resource
	 * @return `data:` URL of the inline attachment for a `cid:` URL, null for other URLs and missing attachments
	 */
	resolve(url: string): string | null {
		if (!CID_URL.test(url)) {
			return null
		}
		const contentId = url.slice('cid:'.length)
		const attachment = this.byContentId.get(contentId)
		if (attachment === undefined) {
			return null
		}
		let dataUrl = this.dataUrls.get(contentId)
		if (dataUrl === undefined) {
			dataUrl = createDataUrl(attachment)
			this.dataUrls.set(contentId, dataUrl)
		}
		return dataUrl
	}

	/**
	 * @return the inline attachments whose `cid:` URLs were not replaced, which the body does not show
	 */
	unused(): InlineMailAttachment[] {
		return this.attachments.filter((attachment) => !this.dataUrls.has(attachment.contentId))
	}
}

/**
 * Replaces the `cid:` URL of an inline attachment with its `data:` URL, which DOMPurify then checks.
 * Empties other URLs, like the ones of images from the internet or of missing attachments,
 * so that nothing is loaded, even before the Content Security Policy of the render page blocks it.
 *
 * @param attribute attribute before the checks of DOMPurify
 * @param cidResolver `data:` URLs of the inline attachments
 */
export function inlineResources(attribute: UponSanitizeAttributeHookEvent, cidResolver: ContentIdResolver): void {
	if (!RESOURCE_ATTRIBUTES.includes(attribute.attrName)) {
		return
	}
	if (DATA_URL.test(attribute.attrValue)) {
		return
	}
	const dataUrl = cidResolver.resolve(attribute.attrValue)
	if (dataUrl === null) {
		attribute.attrValue = ''
		return
	}
	attribute.attrValue = dataUrl
}

/**
 * @param attachment inline attachment
 * @return `data:` URL with the content as base64
 */
function createDataUrl(attachment: InlineMailAttachment): string {
	const base64 = toBase64(attachment.data)
	// Don't use the unverified mime type of the email.
	// It might be syntactically wrong.
	// Rely on what the browser can detect itself.
	// It detects raster images, which is enough for a preview.
	return `data:;base64,${base64}`
}

/**
 * @param data binary data
 * @return the data as base64
 */
function toBase64(data: Uint8Array): string {
	// Baseline 2025, not yet in all supported browsers.
	// Not in the `lib` of TypeScript, as it would be assumed to be always available.
	const nativeToBase64 = (data as { toBase64?: () => string }).toBase64
	if (nativeToBase64 !== undefined) {
		return nativeToBase64.call(data)
	}

	// Bytes per call of `String.fromCharCode`, small enough to stay below the limit of the number of arguments of a function call.
	const BASE64_CHUNK_SIZE = 0x8000 // 32768
	let binary = ''
	for (let start = 0; start < data.length; start += BASE64_CHUNK_SIZE) {
		binary += String.fromCharCode(...data.subarray(start, start + BASE64_CHUNK_SIZE))
	}
	return btoa(binary)
}
