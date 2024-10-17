<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Hamza Mahjoubi <hamzamahjoubi22@proton.me>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\Controller;

use OCA\Files_EmailViewer\AppInfo\Application;
use OCA\Files_EmailViewer\Exception\ConversionException;
use OCA\Files_EmailViewer\Service\ConversionService;
use OCA\Files_EmailViewer\Service\SetupService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\StreamResponse;
use OCP\Files\File;
use OCP\Files\IRootFolder;
use OCP\IRequest;
use Psr\Log\LoggerInterface;

class PageController extends Controller {
	public function __construct(
		IRequest $request,
		private ?string $userId,
		private SetupService $setupService,
		private IRootFolder $root,
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
	public function convert(int $fileId) {
		if ($this->userId === null) {
			return new DataResponse([], Http::STATUS_BAD_REQUEST);
		}

		if (!$this->setupService->isReady()) {
			return new DataResponse([], Http::STATUS_NOT_IMPLEMENTED);
		}

		$userFolder = $this->root->getUserFolder($this->userId);
		$nodes = $userFolder->getById($fileId);

		if (\count($nodes) === 0) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}

		$node = array_pop($nodes);
		if (!$node instanceof File) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}

		$path = $node->getStorage()->getLocalFile($node->getInternalPath());
		if ($path === false) {
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}

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
