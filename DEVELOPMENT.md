<!--
SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Development

## Building the app

```sh
npm ci
npm run build
```

## How an email is rendered

Email Viewer converts an email to a PDF in the browser and shows the PDF in the PDF Viewer.
The conversion has four steps:

1. **Extract**: reads the body, metadata and attachments of the email.
2. **Transform**: sanitizes the HTML body and embeds its inline images.
3. **Present**: adds a header with the metadata and a list of the attachments.
4. **Render**: lays the email out and draws it into a PDF with SnapDOM, in a separate render page.

### Sequence

```mermaid
sequenceDiagram
	actor User
	box rgba(70, 186, 97, 0.22) Files: backend
		participant Files as Files
	end
	box rgba(70, 186, 97, 0.12) Email Viewer: backend
		participant RenderPageController as Render page controller
	end
	box rgba(128, 128, 128, 0.12) Viewer: frontend
		participant Viewer as Viewer app
	end
	box rgba(0, 130, 201, 0.12) Email Viewer: frontend
		participant App as Email Viewer
		participant RenderPage as Render page<br/>iframe
		participant EmailFrame as Email frame<br/>iframe without scripts
	end
	box rgba(0, 130, 201, 0.22) Email Viewer: frontend, SnapDOM library
		participant Snapdom as SnapDOM and its PDF plugin
		participant PluginFrame as Frame of the PDF plugin<br/>iframe without scripts
	end

	User->>Viewer: opens an email
	Viewer->>App: shows the email
	App->>Files: loads the email file
	Files-->>App: email file

	Note over App: extract, transform, present

	App->>RenderPage: opens the render page
	RenderPage->>RenderPageController: loads the page and its script
	RenderPageController-->>RenderPage: page with a strict Content Security Policy
	RenderPage-->>App: ready

	App->>RenderPage: renders the email
	RenderPage->>EmailFrame: lays the email out
	RenderPage->>Snapdom: draws the email into a PDF
	Snapdom->>EmailFrame: captures the email as image
	Snapdom->>PluginFrame: measures the text and links of the capture
	Snapdom-->>RenderPage: PDF
	RenderPage-->>App: PDF
	App->>RenderPage: closes the render page

	App->>Viewer: opens the PDF
	Viewer-->>User: shows the PDF
```

## Tests

```sh
# unit tests with Vitest, `*.test.ts`
npm test
# browser tests with Playwright in Chromium, `*.browser.test.ts`
npx playwright install chromium
npm run test:browser
# after an intended change of the rendering, to update the PDFs in tests/fixtures/rendering-snapshots
npm run test:browser -- --update-snapshots
```

Most test cases are written declaratively in YAML files, without code:

- `tests/fixtures/extract/*.yaml`: emails and what is extracted from them.
  An email is either written out as `.eml` source, or is an `.msg` file in `tests/fixtures/parsing-examples`.
- `tests/fixtures/transform/*.yaml`: HTML and how it looks after sanitizing.

The rendering test cases are plain files in `tests/fixtures/rendering-examples`: emails and HTML pages.
Each one is rendered to a PDF and compared with its snapshot in `tests/fixtures/rendering-snapshots`.

To add a test case, add an entry to a YAML file or a file to `tests/fixtures/rendering-examples`.

## Security

Emails are untrusted. Attacks and their mitigations:

- **Cross-site scripting**
  - DOMPurify removes scripts and event handlers.
  - The Content Security Policy of the render page only allows its own script.
  - The email frame is sandboxed without `allow-scripts`.
- **HTTP leaks**
  - URLs in `src`, `background` and `poster` are emptied, besides `data:` URLs and inline attachments.
  - `<style>` elements are removed.
  - The Content Security Policy blocks all other external resources.
- **Harmful links**
  - Only `http:`, `https:` and `mailto:` links are kept.
- **Submitting data**
  - Forms are removed, and the Content Security Policy blocks form submissions.
