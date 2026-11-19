/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** file as the Viewer app passes it to the view of a handler */
export interface ViewerFileInfo {
	fileid: number
	filename: string
	basename: string
	mime: string
}

/** options of `OCA.Viewer.openWith` */
export interface ViewerOpenOptions {
	fileInfo: object
	list: object[]
	onClose: () => void
}

/** the service of the Viewer app at `OCA.Viewer` */
export interface ViewerService {
	onClose: () => void
	openWith: (handlerId: string, options: ViewerOpenOptions) => void
}
