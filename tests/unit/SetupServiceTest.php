<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Daniel Kesselberg <mail@danielkesselberg.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

use OCA\Files_EmailViewer\Service\SetupService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SetupServiceTest extends TestCase {

	private \OCP\IBinaryFinder|MockObject $binaryFinder;
	private \OCP\IConfig|MockObject $config;
	private SetupService $setupService;

	protected function setUp(): void {
		$this->binaryFinder = $this->createMock(\OCP\IBinaryFinder::class);
		$this->binaryFinder->method('findBinaryPath')
			->willReturn('/usr/bin/java');

		$this->config = $this->createMock(\OCP\IConfig::class);
		$this->config->method('getAppValue')
			->with('files_emailviewer', 'binary_path', '')
			->willReturn('/dev/null');

		$this->setupService = new SetupService($this->binaryFinder, $this->config);
	}

	public function testJava(): void {
		$this->assertTrue($this->setupService->hasJava());
		$this->assertEquals('/usr/bin/java', $this->setupService->getJava());
	}

	public function testEmailConverter(): void {
		$this->assertTrue($this->setupService->hasEmailConverter());
		$this->assertEquals('/dev/null', $this->setupService->getEmailConverter());
	}
}
