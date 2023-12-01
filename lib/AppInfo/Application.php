<?php

declare(strict_types=1);
// SPDX-FileCopyrightText: Hamza Mahjoubi <hamzamahjoubi22@proton.me>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\Files_EmailViewer\AppInfo;

use OCA\Files_EmailViewer\Listeners\LoadViewerListener;
use OCA\Viewer\Event\LoadViewer;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;

class Application extends App implements IBootstrap {
	public const APP_ID = 'files_emailviewer';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}

	public function register(IRegistrationContext $context): void {
		$context->registerEventListener(LoadViewer::class, LoadViewerListener::class);
	}

	public function boot(IBootContext $context): void {
		// TODO: Implement boot() method.
	}
}
