<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Files_EmailViewer\Service;

use OCA\Files_EmailViewer\Exception\ConversionException;
use OCP\ITempManager;

class ConversionService {


	public function __construct(
		private SetupService $setupService,
		private ITempManager $tempManager,
	) {
	}

	/**
	 * @param string $filePath
	 * @return string
	 * @throws ConversionException
	 */
	public function convert(string $filePath): string {
		$resultPath = $this->tempManager->getTemporaryFile('eml2pdf');

		$descriptors = [
			1 => ['pipe', 'w'],
		];

		$command = [
			$this->setupService->getJava(),
			'-jar',
			$this->setupService->getEmailConverter(),
			'--add-attachment-names',
			'--output-filepath',
			$resultPath,
			$filePath,
		];

		$env = [
			'LANG=C.UTF-8',
			'LC_ALL=C.UTF-8',
		];

		$process = proc_open($command, $descriptors, $pipes, null, $env);
		if ($process === false) {
			throw new ConversionException('Could not invoke emailconverter.jar');
		}

		$stdout = stream_get_contents($pipes[1]);
		fclose($pipes[1]);

		if ($stdout === false) {
			throw new ConversionException('Could not get emailconverter.jar stdout');
		}

		if (str_contains($stdout, 'Conversion finished') === false) {
			throw new ConversionException('Conversion did not finish');
		}

		$status = proc_close($process);
		if ($status !== 0) {
			throw new ConversionException('The process ended with exit code ' . $status);
		}

		return $resultPath;
	}
}
