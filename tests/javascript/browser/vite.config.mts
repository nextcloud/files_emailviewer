/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { Plugin } from 'vite'

import { createBaseConfig } from '@nextcloud/vite-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** the URL of the render page on the server */
const RENDER_FRAME_PAGE_URL = '/index.php/apps/files_emailviewer/render-frame-page'

const PAGE_DIRECTORY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'page')

/**
 * Serves the stand-in of the render page at the URL of the render page on the server.
 */
function serveRenderFramePage(): Plugin {
	return {
		name: 'serve-render-frame-page',
		configurePreviewServer(server) {
			server.middlewares.use((request, _response, next) => {
				if (request.url === RENDER_FRAME_PAGE_URL) {
					request.url = '/render-frame-page.html'
				}
				next()
			})
		},
	}
}

export default createBaseConfig({
	nodePolyfills: { protocolImports: true },
	config: {
		root: PAGE_DIRECTORY,
		// the nonce of the Content Security Policy of page/render-frame-page.html
		html: { cspNonce: 'render' },
		plugins: [serveRenderFramePage()],
		build: {
			outDir: path.resolve(PAGE_DIRECTORY, '../../../output/browser/page'),
			emptyOutDir: true,
			rollupOptions: {
				input: [
					path.join(PAGE_DIRECTORY, 'index.html'),
					path.join(PAGE_DIRECTORY, 'render-frame-page.html'),
				],
			},
		},
	},
})
