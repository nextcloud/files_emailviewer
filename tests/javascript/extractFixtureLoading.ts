/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { InlineMailAttachment, MailAttachments, MailBody, MailMetadata } from '../../src/model/ExtractedEmail.ts'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'
import { emlToMsg } from './emlToMsg.ts'
import { msgToEml } from './msgToEml.ts'

const FIXTURES_DIRECTORY = join(import.meta.dirname, '../fixtures')

const addressSchema = z.strictObject({
	name: z.string().nullable(),
	address: z.string().nullable(),
})

const metadataSchema = z.strictObject({
	subject: z.string().nullable(),
	from: addressSchema.nullable(),
	to: z.array(addressSchema),
	cc: z.array(addressSchema),
	sentDate: z.iso.datetime().nullable(),
}).partial()

const bodySchema = z.union([
	z.strictObject({ html: z.string() }),
	z.strictObject({ plain: z.string() }),
])

const inlineAttachmentSchema = z.strictObject({
	contentId: z.string(),
	filename: z.string().nullable(),
	mimeType: z.string(),
	data: z.base64(),
})

const attachmentsSchema = z.strictObject({
	inline: z.array(inlineAttachmentSchema),
	files: z.array(z.strictObject({ filename: z.string().nullable() })),
})

/**
 * @param fields fields of the test case besides the description and the email source
 * @return schema of a test case with either an `.eml` source or the path of an `.msg` file in `tests/fixtures`
 */
function withSource<Fields extends z.ZodRawShape>(fields: Fields) {
	const common = { description: z.string().min(1), ...fields }
	return z.union([
		z.strictObject({ ...common, eml: z.string() }),
		z.strictObject({ ...common, msg: z.string() }),
	])
}

const bodyCasesSchema = z.array(z.union([
	withSource({ expectedBody: bodySchema }),
	withSource({ error: z.string() }),
]))

const metadataCasesSchema = z.array(withSource({ expectedMetadata: metadataSchema }))

const attachmentCasesSchema = z.array(withSource({ expectedAttachments: attachmentsSchema }))

export interface MailData {
	loadAsEml: () => Promise<ArrayBuffer>
	loadAsMsg: () => Promise<ArrayBuffer>
}

interface TestCase {
	description: string
	mailData: MailData
}

export interface BodySuccessCase extends TestCase {
	expectedBody: MailBody
}

export interface BodyErrorCase extends TestCase {
	/** message of the expected MailProcessingError */
	error: string
}

export interface MetadataCase extends TestCase {
	/** only the fields that are set are checked */
	expectedMetadata: Partial<MailMetadata>
}

export interface AttachmentCase extends TestCase {
	expectedAttachments: MailAttachments
}

type SourceInput = { eml: string } | { msg: string }
type MetadataInput = z.infer<typeof metadataSchema>
type InlineAttachmentInput = z.infer<typeof inlineAttachmentSchema>

export async function loadBodyCases(): Promise<{ successCases: BodySuccessCase[], errorCases: BodyErrorCase[] }> {
	const inputs = await loadYaml('extract/body.yaml', bodyCasesSchema)

	const successCases: BodySuccessCase[] = []
	const errorCases: BodyErrorCase[] = []
	for (const input of inputs) {
		const mailData = toMailData(input)
		if ('error' in input) {
			errorCases.push({ description: input.description, mailData, error: input.error })
		} else {
			successCases.push({ description: input.description, mailData, expectedBody: input.expectedBody })
		}
	}
	return { successCases, errorCases }
}

export async function loadMetadataCases(): Promise<MetadataCase[]> {
	const inputs = await loadYaml('extract/metadata.yaml', metadataCasesSchema)

	return inputs.map((input) => ({
		description: input.description,
		mailData: toMailData(input),
		expectedMetadata: toExpectedMetadata(input.expectedMetadata),
	}))
}

export async function loadAttachmentCases(): Promise<AttachmentCase[]> {
	const inputs = await loadYaml('extract/attachment.yaml', attachmentCasesSchema)

	return inputs.map((input) => ({
		description: input.description,
		mailData: toMailData(input),
		expectedAttachments: {
			inline: input.expectedAttachments.inline.map(toExpectedInlineAttachment),
			files: input.expectedAttachments.files,
		},
	}))
}

/**
 * @param name file name in `tests/fixtures`
 * @param schema schema of the file content
 */
async function loadYaml<Schema extends z.ZodType>(name: string, schema: Schema): Promise<z.infer<Schema>> {
	const content = await readFile(join(FIXTURES_DIRECTORY, name), 'utf-8')
	return schema.parse(parse(content))
}

/**
 * @param source `.eml` source or path of the `.msg` file in `tests/fixtures`
 * @return both formats, converted from the other one where needed
 */
function toMailData(source: SourceInput): MailData {
	if ('eml' in source) {
		const emlFile = new TextEncoder().encode(source.eml).buffer
		return {
			loadAsEml: async () => emlFile,
			loadAsMsg: async () => emlToMsg(emlFile),
		}
	}
	return {
		loadAsEml: async () => msgToEml(await readCaseFile(source.msg)),
		loadAsMsg: async () => readCaseFile(source.msg),
	}
}

/**
 * @param path path in `tests/fixtures`
 */
async function readCaseFile(path: string): Promise<ArrayBuffer> {
	const file = await readFile(join(FIXTURES_DIRECTORY, path))
	return new Uint8Array(file).buffer
}

/**
 * @param input metadata from the YAML file, with the sent date as ISO 8601 date
 */
function toExpectedMetadata(input: MetadataInput): Partial<MailMetadata> {
	const { sentDate, ...metadata } = input
	if (sentDate === undefined) {
		return metadata
	}
	if (sentDate === null) {
		return { ...metadata, sentDate: null }
	}
	return { ...metadata, sentDate: new Date(sentDate) }
}

/**
 * @param input inline attachment from the YAML file, with base64 encoded data
 */
function toExpectedInlineAttachment(input: InlineAttachmentInput): InlineMailAttachment {
	const data = new Uint8Array(Buffer.from(input.data, 'base64'))
	return { contentId: input.contentId, filename: input.filename, mimeType: input.mimeType, data }
}
