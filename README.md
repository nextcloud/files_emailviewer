<!--
SPDX-FileCopyrightText: Hamza Mahjoubi <hamzamahjoubi22@proton.me>
SPDX-License-Identifier: CC0-1.0
-->

# Email Viewer

This app integrates the fantastic [Email to PDF Converter from Nick Russler](https://github.com/nickrussler/email-to-pdf-converter) into Nextcloud to view msg and eml files online.

## Server configuration

- Nextcloud 28 (with viewer and files_pdfviewer)
- OpenJDK
- [wkhtmltopdf](https://wkhtmltopdf.org/)
- [Email to PDF Converter](https://github.com/nickrussler/email-to-pdf-converter)

## App setup

- Place the app in your apps folder.
- Store a copy of Email to PDF Converter on the server. Nextcloud must have access to it.
- Enable the app (via `occ app:enable files_emailviewer`).
- Set the path to Email to PDF Converter via `occ config:app:set --value /opt/emailconverter-2.6.0-all.jar files_emailviewer binary_path`.
- Upload a msg or eml file and view it in Nextcloud 🙌

## Outgoing connections

If the message contains images from outside sources, Email to PDF (actually wkhtmltopdf) will download the image, which means external connections are required.

## Building the app

	npm ci
	npm run build
