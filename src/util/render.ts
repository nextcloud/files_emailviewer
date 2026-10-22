/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { snapdom } from '@zumer/snapdom'
import { pdf } from '@zumer/snapdom-plugins/pdf'

/** the width that emails are usually designed for */
const EMAIL_WIDTH_PX = 768

/** pixels of the raster per pixel of the layout */
const RESOLUTION = 2
/** fixed instead of the device pixel ratio of the browser, so that the PDF is the same on each device */
const DEVICE_PIXEL_RATIO = 1

const PAGE_SIZE = 'a4'
/** on all sides of the page */
const PAGE_MARGIN_CM = 1

const POINTS_PER_INCH = 72
const CM_PER_INCH = 2.54

/** longest time to wait for an image, after which it is rendered as it is */
const IMAGE_TIMEOUT_MS = 5_000

/**
 * @param element element of the email, in the frame of createEmailFrame
 * @return the PDF
 */
export async function renderPdf(element: HTMLElement): Promise<Blob> {
	await waitForImages(element)
	return drawPdf(element)
}

/**
 * Create a sandboxed frame to attach the mail content to.
 *
 * @return loaded frame with an empty body, for the email
 */
export async function createEmailFrame(): Promise<HTMLIFrameElement> {
	const frame = document.createElement('iframe')
	frame.sandbox.add('allow-same-origin')
	frame.style.display = 'block'
	frame.style.border = '0'
	frame.style.width = `${EMAIL_WIDTH_PX}px`
	// the doctype, as the email would be laid out in quirks mode without it
	frame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin: 0"></body></html>'
	const loaded = new Promise<void>(function waitForLoad(resolve) {
		frame.addEventListener('load', () => resolve(), { once: true })
	})
	document.body.append(frame)
	await loaded
	return frame
}

/**
 * Wait for images to be loaded because only after they are loaded, the document has the correct height.
 *
 * @param element filled element
 */
async function waitForImages(element: HTMLElement): Promise<void> {
	await Promise.all(Array.from(element.querySelectorAll('img'), waitForImage))
}

/**
 * A broken image is rendered as broken, so an error is no reason to fail.
 * An image that takes too long is rendered as it is, so that the email is still shown.
 *
 * @param image image to wait for
 */
function waitForImage(image: HTMLImageElement): Promise<void> {
	image.loading = 'eager'
	if (image.complete) {
		return Promise.resolve()
	}
	return new Promise(function waitForLoadOrError(resolve) {
		image.addEventListener('load', () => resolve(), { once: true })
		image.addEventListener('error', () => resolve(), { once: true })
		setTimeout(resolve, IMAGE_TIMEOUT_MS)
	})
}

/**
 * @param element filled element
 * @return the PDF
 */
async function drawPdf(element: HTMLElement): Promise<Blob> {
	const capture = await snapdom(element, {
		scale: RESOLUTION,
		dpr: DEVICE_PIXEL_RATIO,
		backgroundColor: '#ffffff',
		// so that text wraps like in the element
		reconcile: true,
		plugins: [pdf()],
	})
	return capture.toPdf({
		page: PAGE_SIZE,
		margin: centimetersToPoints(PAGE_MARGIN_CM),
	})
}

/**
 * @param cm length in centimeters
 * @return length in points, the unit of the PDF plugin
 */
function centimetersToPoints(cm: number): number {
	return cm / CM_PER_INCH * POINTS_PER_INCH
}
