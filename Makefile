
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

.PHONY: site
generate-site:
	@python3 ./scripts/generate_site.py $(BUILD_FLAGS)

.PHONY: clean
clean:
	rm -rf $(BUILD)
