/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const path = require('node:path')
const webpackConfig = require('../../../webpack.config.js')

// the URL of the render page on the server
const RENDER_FRAME_PAGE_URL = '/index.php/apps/files_emailviewer/render-frame-page'

module.exports = {
	...webpackConfig,
	entry: {
		renderEmail: path.resolve(__dirname, 'page/renderEmail.ts'),
		transformHtml: path.resolve(__dirname, 'page/transformHtml.ts'),
		'render-frame': webpackConfig.entry['render-frame'],
	},
	output: {
		...webpackConfig.output,
		path: path.resolve(__dirname, '../../output/visual-page'),
		publicPath: '/',
		filename: '[name].js',
		chunkFilename: '[name].js',
	},
	devServer: {
		...webpackConfig.devServer,
		hot: false,
		client: false,
		static: path.resolve(__dirname, 'page'),
		devMiddleware: { writeToDisk: false },
		setupMiddlewares: function serveRenderFramePage(middlewares, devServer) {
			devServer.app.get(RENDER_FRAME_PAGE_URL, function sendRenderFramePage(_request, response) {
				response.sendFile(path.resolve(__dirname, 'page/render-frame-page.html'))
			})
			return middlewares
		},
	},
}
