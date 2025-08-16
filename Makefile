
CURR = ./Sam_Burkhard_CV.yaml
CORE := public/*
BUILD := build

.PHONY: all
all: copy-core build-posts

.PHONY: serve
serve: all
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

.PHONY: build-posts
build-posts:
	@python3 ./scripts/generate_site.py
	@echo Built posts

.PHONY: clean
clean:
	rm -rf $(BUILD)
