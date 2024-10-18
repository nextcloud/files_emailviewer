<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Daniel Kesselberg <mail@danielkesselberg.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\Listeners;

use OCA\Files_EmailViewer\AppInfo\Application;
use OCA\Files_EmailViewer\Service\SetupService;
use OCA\Viewer\Event\LoadViewer;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

/**
 * @template-implements IEventListener<LoadViewer|Event>
 */
class LoadViewerListener implements IEventListener {

	public function __construct(
		private SetupService $setupService,
	) {
	}

	public function handle(Event $event): void {
		if ($event instanceof LoadViewer && $this->setupService->isReady()) {
			Util::addScript(
				Application::APP_ID,
				'files_emailviewer-main',
				'files_pdfviewer'
			);
		}
	}
}
