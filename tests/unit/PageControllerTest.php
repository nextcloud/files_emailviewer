<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Daniel Kesselberg <mail@danielkesselberg.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

use OCA\Files_EmailViewer\Controller\PageController;
use OCA\Files_EmailViewer\Exception\ConversionException;
use OCA\Files_EmailViewer\Service\ConversionService;
use OCA\Files_EmailViewer\Service\SetupService;
use OCP\AppFramework\Http;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\Storage\IStorage;
use OCP\IRequest;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class PageControllerTest extends TestCase {


	private IRequest|MockObject $request;
	private SetupService|MockObject $setupService;
	private IRootFolder|MockObject $rootFolder;
	private ConversionService|MockObject $conversionService;
	private PageController $pageController;

	protected function setUp(): void {
		$this->request = $this->createMock(IRequest::class);
		$this->setupService = $this->createMock(SetupService::class);
		$this->rootFolder = $this->createMock(IRootFolder::class);
		$this->conversionService = $this->createMock(ConversionService::class);

		$this->pageController = new PageController(
			$this->request,
			'alice',
			$this->setupService,
			$this->rootFolder,
			$this->conversionService,
			new \Psr\Log\NullLogger()
		);
	}

	public function testCovertNotReady(): void {
		$this->setupService->method('isReady')
			->willReturn(false);

		$response = $this->pageController->convert(100);

		$this->assertEquals(
			Http::STATUS_NOT_IMPLEMENTED,
			$response->getStatus(),
		);
	}

	public function testCovertNotFoundNoNode(): void {
		$userFolder = $this->createMock(Folder::class);
		$userFolder->method('getById')
			->willReturn([]);

		$this->setupService->method('isReady')
			->willReturn(true);
		$this->rootFolder->method('getUserFolder')
			->willReturn($userFolder);

		$response = $this->pageController->convert(100);

		$this->assertEquals(
			Http::STATUS_NOT_FOUND,
			$response->getStatus(),
		);
	}

	public function testCovertNotFoundWrongNode(): void {
		$node = $this->createMock(Folder::class);

		$userFolder = $this->createMock(Folder::class);
		$userFolder->method('getById')
			->willReturn([$node]);

		$this->setupService->method('isReady')
			->willReturn(true);
		$this->rootFolder->method('getUserFolder')
			->willReturn($userFolder);

		$response = $this->pageController->convert(100);

		$this->assertEquals(
			Http::STATUS_NOT_FOUND,
			$response->getStatus(),
		);
	}

	public function testCovertNotFoundNoLocalFile(): void {
		$storage = $this->createMock(IStorage::class);
		$storage->method('getLocalFile')
			->willReturn(false);

		$node = $this->createMock(File::class);
		$node->method('getStorage')
			->willReturn($storage);
		$node->method('getInternalPath')
			->willReturn('welcome.eml');

		$userFolder = $this->createMock(Folder::class);
		$userFolder->method('getById')
			->willReturn([$node]);

		$this->setupService->method('isReady')
			->willReturn(true);
		$this->rootFolder->method('getUserFolder')
			->willReturn($userFolder);

		$response = $this->pageController->convert(100);

		$this->assertEquals(
			Http::STATUS_NOT_FOUND,
			$response->getStatus(),
		);
	}

	public function testCovertServerError(): void {
		$storage = $this->createMock(IStorage::class);
		$storage->method('getLocalFile')
			->willReturn('/tmp/welcome.eml');

		$node = $this->createMock(File::class);
		$node->method('getStorage')
			->willReturn($storage);
		$node->method('getInternalPath')
			->willReturn('welcome.eml');

		$userFolder = $this->createMock(Folder::class);
		$userFolder->method('getById')
			->willReturn([$node]);

		$this->setupService->method('isReady')
			->willReturn(true);
		$this->rootFolder->method('getUserFolder')
			->willReturn($userFolder);
		$this->conversionService->method('convert')
			->willThrowException(new ConversionException());

		$response = $this->pageController->convert(100);

		$this->assertEquals(
			Http::STATUS_INTERNAL_SERVER_ERROR,
			$response->getStatus(),
		);
	}
}
