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

<script setup lang="ts">
import type { ViewerFileInfo, ViewerService } from '../types/Viewer.ts'

import { t } from '@nextcloud/l10n'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import { PDF_MIME_TYPE } from '../model/MimeType.ts'
import { convertMailToPdf } from '../util/convert.ts'
import { logger } from '../util/logger.ts'

const props = defineProps<{
	/** files of the Viewer, see the Mime mixin of the Viewer app */
	fileList: ViewerFileInfo[]
	/** id of the file in `fileList` to show */
	fileid: number
	/** URL of the file */
	src: string
}>()

const emit = defineEmits<{
	/** the PDF is opened, or the error is shown */
	loaded: []
}>()

const error = ref<unknown>(null)
let isUnmounted = false

const file = computed(() => props.fileList.find((fileInfo) => fileInfo.fileid === props.fileid)!)

onMounted(async () => {
	try {
		const mail = await loadEmail()
		if (isUnmounted) {
			return
		}
		const pdf = await convertMailToPdf(mail, file.value.mime)
		if (isUnmounted) {
			return
		}
		showPdf(file.value, pdf)
	} catch (caught) {
		logger.error('Converting the email failed', { error: caught })
		error.value = caught
	} finally {
		emit('loaded')
	}
})

onBeforeUnmount(() => {
	isUnmounted = true
})

/**
 * @return the email file
 */
async function loadEmail(): Promise<ArrayBuffer> {
	const response = await fetch(props.src)
	if (!response.ok) {
		throw new Error(`Loading the email failed with status ${response.status}`)
	}
	return response.arrayBuffer()
}

/**
 * @return the service of the Viewer app
 */
function getViewer(): ViewerService {
	return (window as unknown as { OCA: { Viewer: ViewerService } }).OCA.Viewer
}

/**
 * @param fileInfo the email file
 * @param pdf the email as PDF
 */
function showPdf(fileInfo: ViewerFileInfo, pdf: Blob): void {
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
	const viewer = getViewer()
	const previousOnClose = viewer.onClose
	viewer.openWith('pdf', {
		fileInfo: fileInfoPDF,
		list: [fileInfoPDF],
		onClose() {
			URL.revokeObjectURL(pdfBlobUrl)
			previousOnClose()
		},
	})
}
</script>
