<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Daniel Kesselberg <mail@danielkesselberg.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\SetupChecks;

use OCA\Files_EmailViewer\Service\SetupService;
use OCP\IL10N;
use OCP\SetupCheck\ISetupCheck;
use OCP\SetupCheck\SetupResult;

class EmailViewer implements ISetupCheck {
	public function __construct(
		private IL10N $l10n,
		private SetupService $setupService,
	) {
	}

	public function getName(): string {
		return $this->l10n->t('Email Viewer');
	}

	public function getCategory(): string {
		return 'files_emailviewer';
	}

	public function run(): SetupResult {
		if (!$this->setupService->hasProcOpen()) {
			return SetupResult::error(
				$this->l10n->t('Enable the php function proc_open to run the email-to-pdf converter.')
			);
		}

		if (!$this->setupService->hasJava()) {
			return SetupResult::error(
				$this->l10n->t('Java is required to run the email-to-pdf converter.')
			);
		}

		if (!$this->setupService->hasEmailConverter()) {
			return SetupResult::error(
				$this->l10n->t('Please install https://github.com/nickrussler/email-to-pdf-converter and set the path via `%s`', ['occ config:app:set --value /opt/emailconverter-3.0.0-all.jar files_emailviewer binary_path'])
			);
		}

		return SetupResult::success();
	}
}
