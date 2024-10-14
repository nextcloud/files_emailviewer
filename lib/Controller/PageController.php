<?php

declare(strict_types=1);

// SPDX-FileCopyrightText: Hamza Mahjoubi <hamzamahjoubi22@proton.me>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\Files_EmailViewer\Controller;

use OCA\Files_EmailViewer\AppInfo\Application;
use OCA\Files_EmailViewer\Exception\ConversionException;
use OCA\Files_EmailViewer\Service\ConversionService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\StreamResponse;
use OCP\Files\IRootFolder;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class PageController extends Controller {
	public function __construct(
		IRequest $request,
		private IRootFolder $root,
		private ?string $userId,
		private ConversionService $conversionService,
		private LoggerInterface $logger,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @return StreamResponse|DataResponse
	 */
	public function convert(string $fileId) {
		$userFolder = $this->root->getUserFolder($this->userId);
		$nodes = $userFolder->getById($fileId);

		if (\count($nodes) === 0) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}

		/** @var \OCP\Files\Node $fileInfo */
		$fileInfo = array_pop($nodes);

		$storage = $fileInfo->getStorage();
		$path = $storage->getLocalFile($fileInfo->getInternalPath());

		try {
			$resultPath = $this->conversionService->convert($path);
		} catch (ConversionException $e) {
			$this->logger->warning($e->getMessage(), ['exception' => $e]);
			return new DataResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		$response = new StreamResponse($resultPath);
		$response->addHeader('Content-Type', 'application/pdf');

		return $response;
	}
}
