/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Error for emails that cannot be processed, as opposed to unexpected errors.
 */
export class MailProcessingError extends Error {
	/**
	 * @param message error message
	 * @param options error options, with the original error as `cause`
	 */
	constructor(message: string, options?: ErrorOptions) {
		super(message, options)
		this.name = 'MailProcessingError'
	}
}
