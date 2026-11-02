<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\Listeners;

use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IRequest;
use OCP\Security\CSP\AddContentSecurityPolicyEvent;
use Psr\Log\LoggerInterface;

/**
 * Allow the PDF viewer iframe to fetch blob: URLs so it can display rendered email PDFs.
 *
 * @template-implements IEventListener<BeforeTemplateRenderedEvent|AddContentSecurityPolicyEvent|Event>
 */
class PdfViewerCspListener implements IEventListener {
	private const PDF_VIEWER_ROUTE = 'files_pdfviewer.display.showpdfviewer';

	private bool $viewingBlobInPdfViewer = false;

	public function __construct(
		private IRequest $request,
		private LoggerInterface $logger,
	) {
	}

	#[\Override]
	public function handle(Event $event): void {
		if ($event instanceof BeforeTemplateRenderedEvent) {
			$response = $event->getResponse();
			// Be strict with checks to extend CSP only when really needed.
			if ($response->getApp() !== 'files_pdfviewer') {
				return;
			}
			if ($response->getTemplateName() !== 'viewer') {
				return;
			}
			// Nextcloud 28 keeps the case of route names, newer versions lowercase them.
			/** @var mixed $route */
			$route = $this->request->getParam('_route');
			if (!is_string($route) || strtolower($route) !== self::PDF_VIEWER_ROUTE) {
				return;
			}
			/** @var mixed $file */
			$file = $this->request->getParam('file');
			if (!is_string($file) || !str_starts_with($file, 'blob:')) {
				return;
			}
			$this->viewingBlobInPdfViewer = true;
		} elseif ($event instanceof AddContentSecurityPolicyEvent) {
			if (!$this->viewingBlobInPdfViewer) {
				return;
			}
			$policy = new ContentSecurityPolicy();
			$policy->addAllowedConnectDomain('blob:');
			$event->addPolicy($policy);
		}
	}
}
