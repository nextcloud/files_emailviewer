<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Daniel Kesselberg <mail@danielkesselberg.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

use OC\AppFramework\Middleware\Security\CSPMiddleware;
use OC\Security\CSP\ContentSecurityPolicyNonceManager;
use OCA\Files_EmailViewer\Controller\PageController;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Server;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class PageControllerTest extends TestCase {

	private IRequest|MockObject $request;
	private IURLGenerator|MockObject $urlGenerator;
	private IAppManager|MockObject $appManager;
	private ContentSecurityPolicyNonceManager|MockObject $nonceManager;
	private PageController $pageController;

	protected function setUp(): void {
		$this->request = $this->createMock(IRequest::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);
		$this->appManager = $this->createMock(IAppManager::class);
		$this->nonceManager = $this->createMock(ContentSecurityPolicyNonceManager::class);

		$this->pageController = new PageController(
			$this->request,
			$this->urlGenerator,
			$this->appManager,
			$this->nonceManager,
		);
	}

	public function testRenderIsBlankWithTheScriptOfTheVersion(): void {
		$this->appManager->method('getAppVersion')
			->willReturn('1.2.3');
		$this->urlGenerator->method('linkTo')
			->willReturnCallback(static fn (string $app, string $file, array $args): string
				=> '/apps/' . $app . '/' . $file . '?v=' . $args['v']);
		$this->nonceManager->method('getNonce')
			->willReturn('nonce-of-nextcloud');

		$response = $this->pageController->getRenderFramePage();

		$this->assertEquals(TemplateResponse::RENDER_AS_BLANK, $response->getRenderAs());
		$this->assertEquals('nonce-of-nextcloud', $response->getParams()['nonce']);
		$this->assertEquals(
			'/apps/files_emailviewer/js/files_emailviewer-render-frame.js?v=1.2.3',
			$response->getParams()['scriptUrl'],
		);
	}

	public function testRenderSendsOnlyTheStrictPolicy(): void {
		$this->nonceManager->method('getNonce')
			->willReturn('a-nonce');
		$response = $this->pageController->getRenderFramePage();
		$cspMiddleware = Server::get(CSPMiddleware::class);
		$response = $cspMiddleware->afterController($this->pageController, 'getRenderFramePage', $response);

		$this->assertEquals(
			"default-src 'none';"
			. "base-uri 'none';"
			. "manifest-src 'self';"
			. "script-src 'nonce-a-nonce';"
			. "style-src  'unsafe-inline';"
			. 'img-src data:;'
			. "frame-ancestors 'self';"
			. "worker-src 'none';"
			. "form-action 'none'",
			$response->getHeaders()['Content-Security-Policy'],
		);
	}
}
