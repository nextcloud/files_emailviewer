<!--
SPDX-FileCopyrightText: Hamza Mahjoubi <hamzamahjoubi22@proton.me>
SPDX-License-Identifier: CC0-1.0
-->

# Email Viewer

[![REUSE status](https://api.reuse.software/badge/github.com/nextcloud/files_emailviewer)](https://api.reuse.software/info/github.com/nextcloud/files_emailviewer)
Email Viewer integrates the excellent [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter) into Nextcloud, enabling you to view .msg and .eml files.

## Requirements

- Nextcloud 28 or newer
- PDF Viewer for Nextcloud
- [PHP proc_open](https://www.php.net/manual/en/function.proc-open.php)
- OpenJDK
- [wkhtmltopdf](https://wkhtmltopdf.org/)
- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter)

## Installation

- Download and enable files_emailviewer
- Store a copy of the Email to PDF Converter on the server, ensuring that Nextcloud has access to it.
- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path`.
- Upload a .msg or .eml file and view it directly in Nextcloud 🙌

## Outgoing connections

- If the email contains images from external sources, the Email to PDF converter will download the images, requiring external connections.
- The current version does not consider Nextcloud's proxy configuration but should follow the system default.

## Building the app

	npm ci
	npm run build
