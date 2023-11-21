<!--
  - @copyright Copyright (c) 2023 Daniel Kesselberg <mail@danielkesselberg.de>
  -
  - @author Daniel Kesselberg <mail@danielkesselberg.de>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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

			OCA.Viewer.openWith('pdf', {
				fileInfo: {
					filename: fileInfo.filename,
					source: sourceUrl,
					basename: fileInfo.basename,
					mime: fileInfo.mime,
					etag: 'fixme',
					hasPreview: false,
					fileid: fileInfo.fileid,
				},
			})
		},
	},
}
</script>
