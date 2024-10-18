<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Daniel Kesselberg <mail@danielkesselberg.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\Service;

use OCA\Files_EmailViewer\AppInfo\Application;
use OCP\IBinaryFinder;
use OCP\IConfig;

class SetupService {

	private string $binaryPath;
	private string|false $disableFunctions;

	public function __construct(
		private IBinaryFinder $binaryFinder,
		private IConfig $config,
	) {
		/** @psalm-suppress DeprecatedMethod */
		$this->binaryPath = $this->config->getAppValue(Application::APP_ID, 'binary_path', '');
		$this->disableFunctions = ini_get('disable_functions');
	}

	public function hasProcOpen(): bool {
		return $this->disableFunctions === false
			|| str_contains($this->disableFunctions, 'proc_open') === false;
	}

	/**
	 * @psalm-assert-if-true string $this->getJava()
	 */
	public function hasJava(): bool {
		return $this->binaryFinder->findBinaryPath('java') !== false;
	}

	public function getJava(): false|string {
		return $this->binaryFinder->findBinaryPath('java');
	}

	public function hasEmailConverter(): bool {
		return $this->binaryPath !== ''
			&& is_readable($this->binaryPath);
	}

	public function getEmailConverter(): string {
		return $this->binaryPath;
	}

	/**
	 * @psalm-assert-if-true string $this->getJava()
	 */
	public function isReady(): bool {
		return $this->hasProcOpen()
			&& $this->hasJava()
			&& $this->hasEmailConverter();
	}
}
