/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ViewerFileInfo } from './types/Viewer.ts'

import { logger } from './util/logger.ts'

/** what the Mime mixin of the Viewer app adds to the component of a handler */
interface ViewerMimeMixin {
	fileList: ViewerFileInfo[]
	fileid: number
	src: string
	doneLoading: () => void
}

interface EmailViewVue2AdapterData {
	/** name of the custom element, null until it is defined */
	elementName: string | null
}

/** `createElement` of Vue 2, which the Viewer app passes to `render` */
type CreateElement = (tag: string, data?: object) => unknown

type EmailViewVue2AdapterInstance = ViewerMimeMixin & EmailViewVue2AdapterData

/**
 * Component of the handler for the Viewer app, which renders it with its own Vue 2.
 * Shows the email with the Vue 3 custom element of src/views/EmailView.vue.
 *
 * Written as Vue 2 options without importing Vue 2:
 * the Viewer adds its Mime mixin with the props `fileList`, `fileid` and `src`, and the method `doneLoading`,
 * and passes its `createElement` to `render`.
 */
export default {
	name: 'EmailViewVue2Adapter',

	data(): EmailViewVue2AdapterData {
		return {
			elementName: null,
		}
	},

	async created(this: EmailViewVue2AdapterInstance): Promise<void> {
		try {
			// imported only here, so that Vue 3 and the view load when an email is opened
			const { EMAIL_VIEW_ELEMENT_NAME } = await import('./defineEmailViewElement.ts')
			this.elementName = EMAIL_VIEW_ELEMENT_NAME
		} catch (error) {
			logger.error('Loading the email view failed', { error })
			this.doneLoading()
		}
	},

	render(this: EmailViewVue2AdapterInstance, createElement: CreateElement): unknown {
		if (this.elementName === null) {
			return createElement('div')
		}
		return createElement(this.elementName, {
			style: { display: 'block', height: '100%' },
			// properties instead of attributes, so that the list of files is passed as it is
			domProps: {
				fileList: this.fileList,
				fileid: this.fileid,
				src: this.src,
			},
			on: {
				loaded: () => this.doneLoading(),
			},
		})
	},
}
