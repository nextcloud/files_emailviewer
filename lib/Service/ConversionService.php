<?php

declare(strict_types=1);

// SPDX-FileCopyrightText: Hamza Mahjoubi <hamzamahjoubi22@proton.me>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\Files_EmailViewer\Service;

use OCA\Files_EmailViewer\AppInfo\Application;
use OCA\Files_EmailViewer\Exception\ConversionException;
use OCP\IConfig;
use OCP\ITempManager;

class ConversionService {

	private string $binaryPath;

	public function __construct(
		private IConfig $config,
		private ITempManager $tempManager,
	) {
		$this->binaryPath = $this->config->getAppValue(Application::APP_ID, 'binary_path', '');
	}

	/**
	 * @return string
	 * @throws ConversionException
	 */
	public function convert(string $filePath): string {
		$this->checkRequirements();

		$resultPath = $this->tempManager->getTemporaryFile('eml2pdf');

		$descriptors = [
			1 => ['pipe', 'w'],
		];

		$command = [
			'java',
			'-jar',
			$this->binaryPath,
			$filePath,
			'-o',
			$resultPath
		];

		$process = proc_open($command, $descriptors, $pipes);
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

	private function checkRequirements() {
		$disableFunctions = ini_get('disable_functions');
		if ($disableFunctions !== false && str_contains($disableFunctions, 'proc_open')) {
			throw new ConversionException('proc_open is disabled');
		}

		if ($this->binaryPath === '' || !file_exists($this->binaryPath)) {
			throw new ConversionException('emailconverter.jar not found');
		}
	}
}
