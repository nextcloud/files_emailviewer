<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\Controller;

use OC\Security\CSP\ContentSecurityPolicyNonceManager;
use OCA\Files_EmailViewer\AppInfo\Application;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\EmptyContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;

class PageController extends Controller {
	public function __construct(
		IRequest $request,
		private IURLGenerator $urlGenerator,
		private IAppManager $appManager,
		private ContentSecurityPolicyNonceManager $nonceManager,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	/**
	 * The page in which an email is rendered to PDF, see src/render-frame.ts.
	 */
	#[PublicPage]
	#[NoCSRFRequired]
	public function getRenderFramePage(): TemplateResponse {
		$nonce = $this->nonceManager->getNonce();

		// `ContentSecurityPolicy` would be merged with the default CSP, which would widen it.
		$policy = new EmptyContentSecurityPolicy();

		// `addAllowedScriptDomain("'self'")` needs to be set together with `useJsNonce($nonce);`.
		// Otherwise `EmptyContentSecurityPolicy#buildPolicy` fails to execute.
		// The resulting CSP still only allows the nonced script,
		// because `#buildPolicy` drops `'self'` when a nonce is provided.
		$policy->addAllowedScriptDomain("'self'");
		$policy->useJsNonce($nonce);
		// Set `worker-src` explicitly because otherwise browsers fallback to the value of `script-src`.
		$policy->addAllowedWorkerSrcDomain("'none'");

		$policy->allowInlineStyle();
		$policy->addAllowedImageDomain('data:');

		$policy->addAllowedFormActionDomain("'none'");

		$policy->addAllowedFrameAncestorDomain("'self'");

		$scriptUrl = $this->urlGenerator->linkTo(Application::APP_ID, 'js/files_emailviewer-render-frame.js', [
			// a new URL for each version of the app, so that browsers do not use the script of an old version
			'v' => $this->appManager->getAppVersion(Application::APP_ID),
		]);

		$response = new TemplateResponse(Application::APP_ID, 'render-frame-page', [
			'scriptUrl' => $scriptUrl,
			'nonce' => $nonce,
		], TemplateResponse::RENDER_AS_BLANK);
		$response->setContentSecurityPolicy($policy);
		return $response;
	}
}
