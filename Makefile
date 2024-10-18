# SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

app_name=files_emailviewer

project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build/artifacts
source_dir=$(build_dir)/$(app_name)
package_name=$(app_name)
version+=main

clean-build:
	rm -rf $(build_dir)
	mkdir -p $(source_dir)

appstore: clean-build
	rsync -a \
	--exclude=.eslintrc.js \
	--exclude=.git \
	--exclude=.git-blame-ignore-revs \
	--exclude=.gitattributes \
	--exclude=.github \
	--exclude=.gitignore \
	--exclude=.l10nignore \
	--exclude=.php-cs-fixer.cache \
	--exclude=.php-cs-fixer.dist.php \
	--exclude=.tx \
	--exclude=Makefile \
	--exclude=README.md \
	--exclude=babel.config.js \
	--exclude=build \
	--exclude=node_modules \
	--exclude=psalm.xml \
	--exclude=src \
	--exclude=stylelint.config.js \
	--exclude=tests \
	--exclude=vendor-bin \
	--exclude=vendor/bin \
	--exclude=webpack.config.js \
	$(project_dir)/ $(source_dir)
	tar -czf $(build_dir)/$(app_name).tar.gz -C $(build_dir) $(app_name)
