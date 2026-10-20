<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div v-if="error !== null" style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 0 16px;">
		<NcNoteCard type="error" :heading="t('files_emailviewer', 'The email cannot be shown')">
			{{ t('files_emailviewer', 'The file might be damaged or in a format that is not supported.') }}
		</NcNoteCard>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import { PDF_MIME_TYPE } from '../model/MimeType.ts'
import { convertMailToPdf } from '../util/convert.ts'
import { logger } from '../util/logger.ts'

export default {
	name: 'EmailView',

	components: {
		NcNoteCard,
	},

	data() {
		return {
			error: null,
			isDestroyed: false,
		}
	},

	computed: {
		file() {
			// fileList and fileid are provided by the Mime mixin of the Viewer.
			return this.fileList.find((file) => file.fileid === this.fileid)
		},
	},

	async mounted() {
		try {
			const mail = await this.loadEmail()
			if (this.isDestroyed) {
				return
			}
			const pdf = await convertMailToPdf(mail, this.file.mime)
			if (this.isDestroyed) {
				return
			}
			this.showPdf(this.file, pdf)
		} catch (error) {
			logger.error('Converting the email failed', { error })
			this.error = error
		} finally {
			this.doneLoading()
		}
	},

	// eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle -- Vue 2 has no beforeUnmount
	beforeDestroy() {
		this.isDestroyed = true
	},

	methods: {
		t,

		async loadEmail() {
			const response = await fetch(this.src)
			if (!response.ok) {
				throw new Error(`Loading the email failed with status ${response.status}`)
			}
			return response.arrayBuffer()
		},

		showPdf(fileInfo, pdf) {
			const pdfBlobUrl = URL.createObjectURL(pdf)
			const fileInfoPDF = {
				filename: fileInfo.filename,
				source: pdfBlobUrl,
				basename: fileInfo.basename,
				mime: PDF_MIME_TYPE,
				etag: 'fixme',
				hasPreview: false,
				fileid: fileInfo.fileid,
			}

			// openWith replaces the callbacks of whoever opened the viewer, like the Files app
			const previousOnClose = OCA.Viewer.onClose
			OCA.Viewer.openWith('pdf', {
				fileInfo: fileInfoPDF,
				list: [fileInfoPDF],
				onClose() {
					URL.revokeObjectURL(pdfBlobUrl)
					previousOnClose()
				},
			})
		},
	},
}
</script>
