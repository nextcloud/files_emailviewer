<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<p>Loading ...</p>
</template>

<script>
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'EmailView',

	computed: {
		file() {
			// fileList and fileid are provided by the Mime mixin of the Viewer.
			return this.fileList.find((file) => file.fileid === this.fileid)
		},
	},

	async mounted() {

		this.showViewer(this.file)
		this.doneLoading()

		this.$nextTick(function() {
			this.$el.focus()
		})
	},

	methods: {
		canConvert(fileInfo) {
			return (fileInfo.mime === 'application/vnd.ms-outlook' || fileInfo.mime === 'message/rfc822')
				&& OCA.Viewer.mimetypes.includes(fileInfo.mime)
		},

		showViewer(fileInfo) {
			if (!this.canConvert(fileInfo)) {
				return
			}

			const sourceUrl = generateUrl('/apps/files_emailviewer/convert?fileId={fileId}', {
				fileId: fileInfo.fileid,
			})

			const fileInfoPDF = {
				filename: fileInfo.filename,
				source: sourceUrl,
				basename: fileInfo.basename,
				mime: fileInfo.mime,
				etag: 'fixme',
				hasPreview: false,
				fileid: fileInfo.fileid,
			}

			OCA.Viewer.openWith('pdf', {
				fileInfo: fileInfoPDF,
				list: [fileInfoPDF],
			})
		},
	},
}
</script>
