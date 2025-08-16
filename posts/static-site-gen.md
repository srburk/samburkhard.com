
---
title: 'Building a Static Site Generator in Python'
date: 08-16-2025
summary: 'Writing a static site generator for this website.'
---

## TLDR

I wrote a Python static site generator to automate building html files for posts and projects. You can look at my code [here](https://github.com/srburk/samburkhard.com).

## Motivation

I've been wanting to update this website for quite a while, but have found it frustrating to keep updating the HTML for projects and posts as I add them. The easiest approach here is to integrate an existing static site generator (SSG) to automate the build process for sub html pages, but I've resisted doing that because I find that they often are too heavy for my needs.

For this reason, I decided to quickly build a simple SSG to accomplish my very limited needs. These are the main features I want:

* **Write in markdown** – Much simpler than writing in HTML, and [Apple Notes now supports markdown export in iOS 26](https://daringfireball.net/linked/2025/06/04/apple-notes-markdown). 
* **Generate RSS feed** – I'm a big RSS user even though it definitely predates me being on the internet. I find it frustrating when sites don't support it, so here we are.
* **Simple Templates** – I still need some form of templating for posts like this, so just basic variable injection is sufficient.

Again, this is not a novel feature list. Practically every SSG supports this (or at least has plugins in the case of RSS). The motivation for me is to have full control over an extremely lightweight build process. That way, if I need to add new features or overhaul in the future, I know how everything works, and I don't rely on a third party.

At the most basic level, write markdown, throw it in a folder with a yaml frontmatter, and build. That's it.

## Python

I chose to use Python here, because it's easy for quick iteration and fast enough for my purposes. Larger SSGs can do complex content management and can deal with hundereds of files and pages. I don't need that!

I'm not fully reinventing the wheel here, and have no intention to write a yaml parser or a markdown engine. For this project, I just used the most popular python packages: PYAML and [Markdown](https://pypi.org/project/Markdown/).

Following the design patterns of most static site generators, my posts and projects are defined my yaml frontmatters in markdown files like this:

```yaml
---
title: 'Building a Static Site Generator in Python'
date: 08-16-2025
---

# Markdown markdown markdown!!
```

So, the script does the following things when run:

1. Look at the `posts` and `projects` folders, and generate a new `index.html` for each using the post and project templates.
2. Generate a root `index.html` using the index template and inject small html elements to point to the posts and projects generated in the last step.
3. Build an RSS feed from the posts list, and save as `feed.xml`

Very simple.

## Templates

Templates are saved as `.html` files with `{ variable }` as the format for injecting variables. Python string formatting handles replacing the curly braces with the actual values. The main thing here is that every piece of generated html is embedded within a **base template** that has the main formatting tags for CSS and a shared sidebar, header, and footer.

## RSS

I like RSS feeds, so I wanted to include a build step for generating a feed from the post lists.

## Makefile

I'm a firm believer in making things easy and dumb to build and run. To that end, I use this `Makefile` to build the website:

```bash
# Makefile

CORE := public/*
BUILD := build

BUILD_FLAGS = --rss

.PHONY: all
all: copy-core generate-site

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

.PHONY: site
generate-site:
	@python3 ./scripts/generate_site.py $(BUILD_FLAGS)

.PHONY: clean
clean:
	rm -rf $(BUILD)
```

Typing `make` every time I want to see my markdown rendered or a template update is tedious. I added a bash script to use fswatch on macOS to trigger a new build whenever a change is detected. 

```bash
#!/bin/bash
# scripts/watch.sh

trap "echo -n 'Stopping watcher'; exit 0" SIGINT SIGTERM

fswatch -0 --exclude "build" "./" | while read -d "" file; do
    if [[ "$file" == *.md || "$file" == *.html || "$file" == *.js || "$file" == *.css ]]; then
        echo "Detected change in $file, rebuilding..."
        make all
    fi
done
```

## Hosting

I've been hosting on Github Pages for maybe 2 years now. I highly recommend it, I've never had any issues. Adding a custom domain is simple, and I can easily add a workflow for the build step before deployment.

ADD PICTURE OF WORKFLOW HERE.

## Closing


