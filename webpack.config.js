/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const webpackConfig = require('@nextcloud/webpack-vue-config')
const webpackRules = require('@nextcloud/webpack-vue-config/rules')
const path = require('node:path')

// The source maps of the render page might not load as its CSP only allows the nonced script.
// Some browsers apply the CSP of the page to the requests of the developer tools for source maps.
webpackConfig.devtool = 'source-map'

webpackConfig.entry['render-frame'] = path.resolve(__dirname, 'src/render-frame.ts')

// `npm run build` checks the types with `npm run typecheck` before, so ts-loader only transpiles
webpackRules.RULE_TS.use = [
	'babel-loader',
	{ loader: 'ts-loader', options: { transpileOnly: true } },
]

module.exports = webpackConfig
