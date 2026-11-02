/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-FileCopyrightText: 2024 Ferdinand Thiessen <opensource@fthiessen.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { configureNextcloud, docker, getContainer, startNextcloud, stopNextcloud, waitOnNextcloud } from '@nextcloud/e2e-test-server/docker'
import { getBranchForVersion, getSupportedVersionRange } from './get-supported-server-versions.mts'

const NEXTCLOUD_CONFIGURED_MESSAGE = 'Nextcloud is configured for files_emailviewer tests'

/**
 *
 */
async function start() {
	const branch = await getBranch()
	const branchOfExistingContainer = await getExistingContainerBranch()
	const recreate = !(branchOfExistingContainer === branch)
	const ip = await startNextcloud(branch, true, {
		exposePort: 8089,
		forceRecreate: recreate,
	})
	await waitOnNextcloud(ip)
	// Configuring in this process makes vendored apps use the branch of the started server
	await configureNextcloud(['viewer', 'files_pdfviewer', 'files_emailviewer'])
	// Playwright waits for this line before running tests (see `webServer.wait` in playwright.config.ts)
	console.log(NEXTCLOUD_CONFIGURED_MESSAGE)
}

/**
 *
 */
async function getExistingContainerBranch(): Promise<string | null> {
	try {
		const { Config } = await getContainer().inspect()
		return Config.Env.find((env: string) => env.startsWith('BRANCH='))?.slice('BRANCH='.length)
	} catch (error) {
		// No existing container
		if ((error as { statusCode?: number }).statusCode === 404) {
			return null
		}
		throw error
	}
}

/**
 *
 */
async function getBranch(): Promise<string> {
	if (process.env.NEXTCLOUD_BRANCH) {
		return process.env.NEXTCLOUD_BRANCH
	}
	const { max } = await getSupportedVersionRange()
	return getBranchForVersion(max)
}

let stopping = false

/**
 * Remove the Nextcloud docker container and exit.
 *
 * @param exitCode - The exit code of the process
 */
async function stop(exitCode = 0) {
	// npm forwards the signal it receives, so we can get it twice
	if (stopping) {
		return
	}
	stopping = true
	try {
		await stopNextcloud({ saveLogTo: 'tests/output/e2e/nextcloud.log' })
		await docker.getVolume('apps_writable').remove()
	} finally {
		process.exit(exitCode)
	}
}

// Playwright sends SIGTERM when tests are done (see `gracefulShutdown` in playwright.config.ts)
// SIGINT is Ctrl+C when run manually.
// Registered before starting so an interrupted startup is cleaned up as well.
process.on('SIGTERM', () => stop())
process.on('SIGINT', () => stop())

// Start the Nextcloud docker container
try {
	await start()
} catch (error) {
	console.error(error)
	await stop(1)
}

// Idle to wait for shutdown
while (true) {
	await new Promise((resolve) => setTimeout(resolve, 5000))
}
