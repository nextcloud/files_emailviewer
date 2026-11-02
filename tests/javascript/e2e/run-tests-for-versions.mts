/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Run the Playwright tests (`npm run test:e2e`) once per selected Nextcloud version.
 *
 * Usage: node tests/javascript/e2e/run-tests-for-versions.mts <min|max|min-max|all> [playwright args…]
 */

import { spawnSync } from 'child_process'
import { getBranchForVersion, getSupportedVersionRange } from './get-supported-server-versions.mts'

const [mode, ...playwrightArgs] = process.argv.slice(2)

const { min, max } = await getSupportedVersionRange()
let versions: number[]
if (mode === 'min') {
	versions = [min]
} else if (mode === 'max') {
	versions = [max]
} else if (mode === 'min-max') {
	versions = min === max ? [min] : [min, max]
} else if (mode === 'all') {
	versions = Array.from({ length: max - min + 1 }, (_, i) => min + i)
} else {
	throw new Error(`Unknown mode '${mode}', expected 'min', 'max', 'min-max' or 'all'`)
}

const failedBranches: string[] = []
for (const version of versions) {
	const branch = getBranchForVersion(version)
	console.log(`\nRunning Playwright tests against ${branch}…`)
	const { status } = spawnSync('npm', ['run', 'test:e2e', '--', ...playwrightArgs], {
		stdio: 'inherit',
		env: { ...process.env, NEXTCLOUD_BRANCH: branch },
	})
	if (status !== 0) {
		failedBranches.push(branch)
	}
}

if (failedBranches.length > 0) {
	console.error(`\nPlaywright tests failed for: ${failedBranches.join(', ')}`)
	process.exit(1)
}
