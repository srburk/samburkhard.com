
CORE := public/*
BUILD := build

BUILD_FLAGS = --rss

.PHONY: all
all: copy-core generate-site

.PHONY: draft
draft: copy-core
	@python3 ./scripts/generate_site.py $(BUILD_FLAGS) --allow_draft

.PHONY: serve
serve: draft
	@bash -c '\
		python3 -m http.server 8080 --directory $(BUILD) 1> /dev/null & \
		server_pid=$$!; \
		echo "Serving at http://127.0.0.1:8080/"; \
		bash ./scripts/watch.sh; \
		echo -n "Stopping Python server..."; \
		kill $$server_pid \
	'

.PHONY: copy-core
copy-core:
	@mkdir -p $(BUILD)
	@cp -r $(CORE) $(BUILD)/
	@cp "$(BUILD)/Rich Link Preview.png" "$(BUILD)/og-image.png"

.PHONY: site
generate-site:
	@python3 ./scripts/generate_site.py $(BUILD_FLAGS)

.PHONY: preview
preview: all
	@echo "Serving production build at http://127.0.0.1:8080/"
	@python3 -m http.server 8080 --bind 127.0.0.1 --directory $(BUILD)

.PHONY: lighthouse
lighthouse: all
	@npx --yes @lhci/cli@0.14.x autorun --config=lighthouserc.json

.PHONY: clean
clean:
	rm -rf $(BUILD) .lighthouseci
