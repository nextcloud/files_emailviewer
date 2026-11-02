/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { readFile } from 'fs/promises'

/**
 * Get the min and max Nextcloud version supported by the app.
 */
export async function getSupportedVersionRange(): Promise<{ min: number, max: number }> {
	const appinfo = await readFile('appinfo/info.xml', 'utf-8')
	const match = appinfo.match(/<nextcloud min-version="(\d+)" max-version="(\d+)" \/>/)
	if (!match) {
		throw new Error('Could not find min-version and max-version of nextcloud in appinfo/info.xml')
	}
	return { min: Number(match[1]), max: Number(match[2]) }
}

/**
 * Get the server branch to test a Nextcloud version against.
 *
 * @param version - The Nextcloud major version
 */
export function getBranchForVersion(version: number): string {
	return `stable${version}`
}
