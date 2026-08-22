#!/usr/bin/env python3
"""Fail the build if generated pages are missing required SEO/social metadata."""

from pathlib import Path
import sys
from html.parser import HTMLParser

BUILD_FOLDER = Path("./build")
SKIP_DIRS = {"leetcode-minimal", "images"}

REQUIRED_META_NAMES = {
    "description",
    "viewport",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
}

REQUIRED_META_PROPERTIES = {
    "og:title",
    "og:description",
    "og:image",
    "og:url",
    "og:type",
}

REQUIRED_LINK_RELS = {
    "canonical",
    "icon",
}


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.title = ""
        self._capture_title = False
        self.meta_names = {}
        self.meta_properties = {}
        self.link_rels = {}
        self.html_lang = None
        self.anchors_in_head = 0
        self.has_skip_link = False
        self.favicon_hrefs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.html_lang = attrs.get("lang")
        if tag == "head":
            self.in_head = True
        if tag == "title" and self.in_head:
            self._capture_title = True
        if tag == "meta":
            name = attrs.get("name")
            prop = attrs.get("property")
            content = (attrs.get("content") or "").strip()
            if name:
                self.meta_names[name] = content
            if prop:
                self.meta_properties[prop] = content
        if tag == "link":
            rel = (attrs.get("rel") or "").lower()
            href = attrs.get("href") or ""
            if rel:
                self.link_rels[rel] = href
            if rel == "icon":
                self.favicon_hrefs.append(href)
        if tag == "a":
            if self.in_head:
                self.anchors_in_head += 1
            href = attrs.get("href") or ""
            classes = attrs.get("class") or ""
            if "skip-link" in classes or href == "#content":
                self.has_skip_link = True

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        if tag == "title":
            self._capture_title = False

    def handle_data(self, data):
        if self._capture_title:
            self.title += data


def iter_pages():
    if not BUILD_FOLDER.exists():
        raise SystemExit("build/ is missing. Run `make` first.")

    index = BUILD_FOLDER / "index.html"
    if index.exists():
        yield index

    not_found = BUILD_FOLDER / "404.html"
    if not_found.exists():
        yield not_found

    for path in sorted(BUILD_FOLDER.glob("*/index.html")):
        if path.parent.name in SKIP_DIRS:
            continue
        yield path


def check_page(path: Path) -> list[str]:
    errors = []
    parser = HeadParser()
    parser.feed(path.read_text(encoding="utf-8"))

    rel = path.relative_to(BUILD_FOLDER)

    if not parser.html_lang:
        errors.append(f"{rel}: <html> is missing lang")
    if not parser.title.strip():
        errors.append(f"{rel}: missing <title>")
    if parser.anchors_in_head:
        errors.append(f"{rel}: <a> tags are not allowed in <head>")

    for name in REQUIRED_META_NAMES:
        if not parser.meta_names.get(name):
            errors.append(f"{rel}: missing meta name={name}")

    for prop in REQUIRED_META_PROPERTIES:
        if not parser.meta_properties.get(prop):
            errors.append(f"{rel}: missing meta property={prop}")

    for rel_name in REQUIRED_LINK_RELS:
        if not parser.link_rels.get(rel_name):
            errors.append(f"{rel}: missing <link rel={rel_name}>")

    viewport = parser.meta_names.get("viewport", "")
    if "width=device-width" not in viewport:
        errors.append(f"{rel}: viewport is not mobile-friendly")

    favicon = parser.link_rels.get("icon", "")
    if favicon.startswith("/public/"):
        errors.append(f"{rel}: favicon still points at /public/ (404 on GitHub Pages)")

    og_url = parser.meta_properties.get("og:url", "")
    canonical = parser.link_rels.get("canonical", "")
    if og_url and canonical and og_url != canonical:
        errors.append(f"{rel}: og:url ({og_url}) does not match canonical ({canonical})")

    description = parser.meta_names.get("description", "")
    og_title = parser.meta_properties.get("og:title", "")
    if path.name == "index.html" and path.parent == BUILD_FOLDER:
        if description == og_title:
            errors.append(f"{rel}: homepage og:description should not repeat the title")
        if not parser.has_skip_link:
            errors.append(f"{rel}: missing skip-to-content link")

    if "Rich%20Link" in parser.meta_properties.get("og:image", ""):
        errors.append(f"{rel}: og:image still uses a space-encoded filename")

    return errors


def main() -> int:
    pages = list(iter_pages())
    if not pages:
        print("No generated HTML pages found in build/", file=sys.stderr)
        return 1

    errors = []
    for page in pages:
        errors.extend(check_page(page))

    robots = BUILD_FOLDER / "robots.txt"
    if not robots.exists():
        errors.append("robots.txt is missing")
    elif "Sitemap:" not in robots.read_text(encoding="utf-8"):
        errors.append("robots.txt is missing a Sitemap directive")

    sitemap = BUILD_FOLDER / "sitemap.xml"
    if not sitemap.exists():
        errors.append("sitemap.xml is missing")

    if errors:
        print("Metadata checks failed:\n", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"✅ Metadata checks passed for {len(pages)} page(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
