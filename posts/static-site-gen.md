
---
title: 'Building a Static Site Generator in Python'
date: 08-16-2025
summary: 'Writing a static site generator for this website.'
draft: false
---

## TLDR

I wrote a Python static site generator to automate building HTML files for posts and projects. You can look at my code at [https://github.com/srburk/samburkhard.com](https://github.com/srburk/samburkhard.com).


## Motivation

I've been wanting to update this website for quite a while, but I have found it frustrating to keep updating the HTML for projects and posts as I add them. The easiest approach here is to integrate an existing static site generator (SSG) to automate the build process for sub HTML pages, but I've resisted doing that because I've found that they are often too heavy for my needs. 

For this reason, I decided to quickly build a simple SSG to accomplish my very limited needs. These are the main features I want:

* **Uses Markdown** – Much simpler than writing in HTML, and [Apple Notes now supports markdown export in iOS 26](https://daringfireball.net/linked/2025/06/04/apple-notes-markdown). 
* **Generates an RSS feed** – I'm a big RSS user, even though it's older than me (Google says the New York Times started offering RSS feeds in 2002). I find it frustrating when sites don't support it, so it'd be hypocritical if I didn't.
* **Simple Templates** – I still need some form of templating for posts like this, so just basic variable injection is sufficient.

Again, this is not a novel feature list. Practically every SSG supports this (or at least has plugins in the case of RSS). The motivation for me is to have full control over an extremely lightweight build process. I'm following Keep It Simple Stupid principles all the way here. That way, if I need to add new features or do an overhaul in the future, I know how everything works, and I limit my reliance on third parties.

At the most basic level, write markdown, throw it in a folder with a yaml frontmatter, and build. **That's it.**

## Python

I chose to use Python because it's easy for quick iteration and fast enough for my purposes. Larger SSGs can work with hundreds of files and pages, and I don't need that kind of performance.

I'm not fully reinventing the wheel here, and have no intention to write a YAML parser or a Markdown engine. For this project, I just used the most popular Python packages I could find: [PYAML](https://pyyaml.org/wiki/PyYAML) and [Markdown](https://pypi.org/project/Markdown/). Similarly, for the RSS feed generation, I used [lxml](https://lxml.de) for the XML processing.

So, the script does the following things when run:

1. Look at the `posts` and `projects` folders, and generate a new `index.html` for each using the post and project templates.
2. Generate a root `index.html` using the index template and inject small HTML elements to point to the posts and projects generated in the last step.
3. Build an RSS feed from the posts list, and save it as`feed.xml`

Every build artifact is put in the `build` folder and passed off to Github Pages for deployment.

## Markdown & YAML Frontmatters

Keeping things to markdown makes things really simple for writing. I'm keeping all the markdown files in a folder in my git repository for easy version management. 

Following the design patterns of most SSGs, my posts and projects are defined by YAML frontmatters in markdown files like this:

```yaml
---
title: 'Building a Static Site Generator in Python'
date: 08-16-2025
summary: 'Writing a static site generator for this website.'
draft: true
---

# Amazing markdown article
```

Most of the fields are self-explanatory, but I added the `draft` field to exclude posts from the build process if the flag `--allow-draft` is not set.

## Template System

In SSGs, templates are used to define a fixed page type and fill it in with dynamic elements. You are currently reading from a templated HTML file. In my SSG, Templates are saved as `.html` files with `{ variable }` as the format for injecting variables. Python string formatting handles replacing the curly braces with the actual values.

The generator takes the YAML from the markdown and does a quick text replacement with the template, which might look like this:

```html
<h2 class="title">{title}</h2>
<p>Published {date}</p>
<hr />
{content}
```

`content` here is filled with the processed HTML from the markdown engine. This is a very small template since this is a simple website. The main piece here is that every piece of generated HTML is embedded within a **base template** that has the main formatting tags for CSS and a shared sidebar, header, and footer.

Here's my generic template builder I wrote:

```
def render_page(template: str, html: str, frontmatter: dict):
    # Load template
    with open(f"./templates/{template}", "r", encoding="utf-8") as f:
        template = f.read()
     
    formatter = string.Formatter()
    fields = [fname for _, fname, _, _ in formatter.parse(template) if fname]
    
    kwargs = {}
    for field in fields:
        if field == "content":
            kwargs[field] = html
        elif field in frontmatter:
            kwargs[field] = frontmatter[field]
        else:
            raise KeyError(f"Missing required field: {field}")

    rendered_content = template.format(**kwargs)
    
    return render_in_base(frontmatter.get("title", "Sam Burkhard"), rendered_content)
```

I like this approach because it can automatically pull variables from the template and attempt to match them with an equivalent field in the frontmatter. With this, I don't need to manually update multiple things or build one-use functions.

## RSS

Really Simple Syndication (RSS) is a great standard for quickly and easily allowing people to regularly check your website. I follow dozens of RSS feeds and check in every day, so I wanted to include an RSS feed on my site. I added a build step for generating a feed from the post lists. I followed the spec [here](https://www.rssboard.org/rss-specification).

The Python code for generating the feed is pretty simple. All an RSS feed is a `.xml` file on a server. Since I already go through each post when processing, we can use the same list of posts to make the RSS feed. As mentioned earlier, I used the library `lxml` to make the XML handling easier.

```python
def generate_rss():

    NS_CONTENT = "http://purl.org/rss/1.0/modules/content/"
    ET.register_namespace("content", NS_CONTENT)
    
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    
    site_link = "https://samburkhard.com"

    ET.SubElement(channel, "title").text = "Sam Burkhard's Website"
    ET.SubElement(channel, "link").text = site_link
    ET.SubElement(channel, "description").text = "Personal website / project showcase"

    for post in sorted(posts, key=lambda p: p.date, reverse=True):
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = post.title
        ET.SubElement(item, "link").text = f"{site_link}/{post.slug}"
        ET.SubElement(item, "guid").text = f"{site_link}/{post.slug}"
        ET.SubElement(item, "description").text = post.description
        
        content_encoded = ET.SubElement(item, f"{{{NS_CONTENT}}}encoded")
        content_encoded.text = ET.CDATA(post.content)

        pub_date = datetime.strptime(post.date, "%m-%d-%Y").replace(
            hour=9, minute=0, second=0, tzinfo=ZoneInfo("America/New_York")
        )
        
        ET.SubElement(item, "pubDate").text = pub_date.strftime(
            "%a, %d %b %Y %H:%M:%S %z"
        )

    tree = ET.ElementTree(rss)
    output_path = BUILD_FOLDER / "feed.xml"
    tree.write(output_path, encoding="utf-8", xml_declaration=True)
    print(f"✅ RSS feed written to {output_path}")
```

## Makefile

I'm a firm believer in making things easy and dumb to build and run. To that end, I wrote this `Makefile` to build the website:

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

This script is called by the `serve` target, which also conveniently starts an HTTP server in the background.

## Folder Structure

The project is structured like so for now. All I need to do to make a new post or project is to make a new markdown file and push to my remote git server, and *voila*.

```
├── Makefile
├── posts
│   ├── dietpi-rss-setup.md
│   ├── static-site-gen.md
│   └── vibe-code-gpt5-test.md
├── projects
│   ├── rf-messenger.md
│   └── shipments.md
├── public
│   ├── favicon.ico
│   ├── Rich Link Preview.png
│   └── styles.css
├── README.md
├── scripts
│   ├── generate_site.py
│   ├── requirements.txt
│   └── watch.sh
└── templates
    ├── 404_template.html
    ├── base_template.html
    ├── index_template.html
    └── post_template.html
```

## GitHub Action

I've been hosting on GitHub Pages for maybe 2 years now. I highly recommend it; I've never had any issues. Adding a custom domain is simple, and I easily added a custom workflow for the build step before deployment. Here is the action I wrote for the build and deployment steps:

```
name: Build and Deploy

on:
  push:
    branches: [ 'main' ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r ./scripts/requirements.txt
      - name: Build
        run: |
          make
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: ./build
  
  deploy:
      needs: build 
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      runs-on: ubuntu-latest
      steps:
        - name: Download build artifacts
          uses: actions/download-artifact@v4
          with:
            name: build-files
            path: ./build
            
        - name: Setup Pages
          uses: actions/configure-pages@v5
          
        - name: Upload artifact
          uses: actions/upload-pages-artifact@v3
          with:
            path: './build'
            
        - name: Deploy to GitHub Pages
          id: deployment
          uses: actions/deploy-pages@v4
```

I just threw it in `.github/workflows/build-and-deploy.yml` and made sure Actions were enabled in the repository settings.

## Closing

And that's it! I will probably spin the SSG into a separate git repo at some point and use it in this website as a submodule, but as far as I'm concerned, this solves all the problems I have right now. 

Clearly this is a simple project, and by no means was this an attempt at a full-scale production solution. Don't throw away Hugo or Astro! Here is a list of future improvements /changes I hope to make:

* **Images:** Right now, images would require a lot of manual management, and I would want to include an image size optimization step to reduce bandwidth.
* **Syntax highlighting** – I'm resistant to the idea of adding external JS, but it looks like `highlight.js` will do the trick.
* **Tags** – Not sold on if this is strictly necessary, but if I could imagine it being useful, depending on my posting volume.
* **Reloading improvements** – My auto-build feature is great, but it doesn't force a refresh on my local browser. Additionally, not everything needs to be rebuilt every time a change happens.

By the time you're reading this, some of these changes may have already been implemented.

If you're interested in checking out the code, it's at [https://github.com/srburk/samburkhard.com](https://github.com/srburk/samburkhard.com).
