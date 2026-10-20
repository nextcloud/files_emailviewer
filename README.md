<!--
SPDX-FileCopyrightText: Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
SPDX-License-Identifier: CC0-1.0
-->

# Email Viewer

[![REUSE status](https://api.reuse.software/badge/github.com/nextcloud/files_emailviewer)](https://api.reuse.software/info/github.com/nextcloud/files_emailviewer)

Email Viewer lets you view `.eml` and `.msg` files in Nextcloud. It renders the email as a PDF in your browser and opens it in the PDF Viewer.

## Requirements

- Nextcloud 34 or newer
- Viewer and PDF Viewer for Nextcloud

## Installation

- Download and enable files_emailviewer
- Upload a `.eml` or `.msg` file and view it directly in Nextcloud 🙌

## Limitations

- **Images from the internet are not shown.** Only images that are part of the email itself are shown.
- **Interactive content is removed.** Forms and similar content do not appear.
- **Some `.msg` files show no text.** Outlook can save the text of an email in its "Rich Text" format. This format is not supported, so a note is shown instead of the text. Other `.msg` files are shown as usual.
- **Attachments are only listed.** The PDF names the attachments, but they cannot be opened from it.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for how to build and test the app and how it renders emails.
