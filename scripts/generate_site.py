from pathlib import Path
from lxml import etree as ET
from datetime import datetime
from zoneinfo import ZoneInfo
from html import escape
import argparse
import markdown
import yaml

# PATHS ARE RELATIVE BC OF CALL FROM Makefile

POSTS_FOLDER = Path("./posts")
PROJECTS_FOLDER = Path("./projects")
BUILD_FOLDER = Path("./build")

SITE_URL = "https://samburkhard.com"
SITE_NAME = "Sam Burkhard"
DEFAULT_DESCRIPTION = (
    "Computer Engineering student at the University of Cincinnati. "
    "Posts and projects on iOS, computer architecture, AI hardware, and low-level programming."
)
OG_IMAGE = f"{SITE_URL}/og-image.png"

posts = []    
projects = []

class Post:
    def __init__(self, slug: str, title: str, date: str, content: str, description=""):
        self.slug = slug
        self.title = title
        self.date = date
        self.description = description
        self.content = content

class Project:
    def __init__(self, title: str, slug: str, summary: str, description: str, link: str = ""):
        self.title = title
        self.slug = slug
        self.summary = summary
        self.link = link
        self.description = description

def _attr(value: str) -> str:
    return escape(value or "", quote=True)


def _document_title(title: str) -> str:
    if not title or title == SITE_NAME:
        return SITE_NAME
    return f"{title} · {SITE_NAME}"


def _canonical_url(path: str) -> str:
    if not path or path == "/":
        return f"{SITE_URL}/"
    if not path.startswith("/"):
        path = "/" + path
    return f"{SITE_URL}{path}"


def render_in_base(
    title: str,
    content: str,
    *,
    description: str = "",
    canonical_path: str = "/",
    og_type: str = "website",
) -> str:
    with open("./templates/base_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    description = (description or "").strip() or DEFAULT_DESCRIPTION
    og_title = title or SITE_NAME

    # Substitute page HTML first so braces in content cannot break templating.
    rendered_page = template.replace("{content}", content, 1)
    rendered_page = rendered_page.replace("{document_title}", _attr(_document_title(og_title)))
    rendered_page = rendered_page.replace("{og_title}", _attr(og_title))
    rendered_page = rendered_page.replace("{description}", _attr(description))
    rendered_page = rendered_page.replace("{canonical_url}", _attr(_canonical_url(canonical_path)))
    rendered_page = rendered_page.replace("{og_type}", _attr(og_type))
    rendered_page = rendered_page.replace("{og_image}", _attr(OG_IMAGE))
    rendered_page = rendered_page.replace("{copyright_date}", str(datetime.now().year))

    return rendered_page

def render_index():

    def render_post_link(post: Post) -> str:
        title = escape(post.title or "")
        description = escape(post.description or "")
        date = escape(str(post.date or ""))
        return (
            f"<article class='post'><h3>{date} | "
            f"<a href='/{post.slug}/'>{title} ↗</a></h3>"
            f"<p>{description}</p></article>"
        ).strip()
    
    def render_project_link(project: Project) -> str:
        title = escape(project.title or "")
        summary = escape(project.summary or "")
        return (
            f"<article class='project'><h3>"
            f"<a href='/{project.slug}/'>{title} ↗</a></h3>"
            f"<p>{summary}</p></article>"
        ).strip()
    
    sorted_posts = sorted(posts, key=lambda d: d.date, reverse=True)
    rendered_post_links = [render_post_link(x) for x in sorted_posts]
    rendered_project_links = [render_project_link(x) for x in projects]
    
    with open("./templates/index_template.html", "r", encoding="utf-8") as f:
        template = f.read()
        
    rendered_content = template.format(
        posts=''.join(rendered_post_links),
        projects=''.join(rendered_project_links)
    )
    
    return render_in_base(
        SITE_NAME,
        rendered_content,
        description=DEFAULT_DESCRIPTION,
        canonical_path="/",
        og_type="website",
    )

def render_page(
    template: str,
    html: str,
    frontmatter: dict,
    *,
    canonical_path: str,
    og_type: str = "article",
):
    with open(f"./templates/{template}", "r", encoding="utf-8") as f:
        template_text = f.read()

    values = {}
    for key, value in (frontmatter or {}).items():
        if value is None:
            continue
        if key in {"title", "date", "description", "summary", "link"}:
            values[key] = escape(str(value))
        else:
            values[key] = str(value)

    rendered_content = template_text
    for key, value in values.items():
        rendered_content = rendered_content.replace("{" + key + "}", value)
    rendered_content = rendered_content.replace("{content}", html)

    title = (frontmatter or {}).get("title") or SITE_NAME
    description = (
        (frontmatter or {}).get("summary")
        or (frontmatter or {}).get("description")
        or DEFAULT_DESCRIPTION
    )

    return render_in_base(
        title,
        rendered_content,
        description=str(description),
        canonical_path=canonical_path,
        og_type=og_type,
    )

def build_posts(args):

    for file_path in POSTS_FOLDER.iterdir():
        if file_path.is_file() and file_path.suffix == ".md":
            with open(file_path, "r", encoding="utf-8") as f:
                
                # iterate through files
                content = f.read()
                
                try:
                    parts = content.split("---", 2)
                    if len(parts) <= 1:
                        # handle front matter
                        raise ValueError("Missing YAML front matter")
                    front_matter = yaml.safe_load(parts[1])
                    html = markdown.markdown(parts[2], extensions=["fenced_code"])
                    
                    if front_matter.get("draft") and not args.allow_drafts:
                        print(f"Skipping draft post: {front_matter.get('title')}")
                        continue
                                                                                
                    rendered_page = render_page(
                        "post_template.html",
                        html,
                        front_matter,
                        canonical_path=f"/{file_path.stem}/",
                        og_type="article",
                    )
                    
                    # write each to a different folder so github pages routes automatically
                    rendered_page_path = BUILD_FOLDER / file_path.stem
                    rendered_page_path.mkdir(exist_ok=True)
                    
                    with open(rendered_page_path / "index.html", "w", encoding="utf-8") as f:
                        f.write(rendered_page)
                    
                    posts.append(Post(file_path.stem, front_matter.get("title"), front_matter.get("date"), content=html, description=front_matter.get("summary", "")))
                    
                except yaml.YAMLError as e:
                    print("YAML parsing error:", e)
                except Exception as e:
                    print("Other error:", e)

def build_projects():

    for file_path in PROJECTS_FOLDER.iterdir():
        if file_path.is_file() and file_path.suffix == ".md":
            with open(file_path, "r", encoding="utf-8") as f:
                
                # iterate through files
                content = f.read()
                
                try:
                    parts = content.split("---", 2)
                    if len(parts) <= 1:
                        # handle front matter
                        raise ValueError("Missing YAML front matter")
                    front_matter = yaml.safe_load(parts[1])
                    html = markdown.markdown(parts[2], extensions=["fenced_code"])
                    
                    if front_matter.get("draft") and not args.allow_drafts:
                        print(f"Skipping draft project: {front_matter.get('title')}")
                        continue
                                                                                
                    rendered_page = render_page(
                        "project_template.html",
                        html,
                        front_matter,
                        canonical_path=f"/{file_path.stem}/",
                        og_type="website",
                    )
                    
                    # write each to a different folder so github pages routes automatically
                    rendered_page_path = BUILD_FOLDER / file_path.stem
                    rendered_page_path.mkdir(exist_ok=True)
                    
                    with open(rendered_page_path / "index.html", "w", encoding="utf-8") as f:
                        f.write(rendered_page)
                    
                    projects.append(Project(front_matter.get("title"), file_path.stem, front_matter.get("summary"), front_matter.get("link"), front_matter.get("description")))
                    
                except yaml.YAMLError as e:
                    print("YAML parsing error:", e)
                except Exception as e:
                    print("Other error:", e)

def generate_rss():

    NS_CONTENT = "http://purl.org/rss/1.0/modules/content/"
    ET.register_namespace("content", NS_CONTENT)
    
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    
    site_link = "https://samburkhard.com"

    ET.SubElement(channel, "title").text = "Sam Burkhard's Website"
    ET.SubElement(channel, "link").text = site_link
    ET.SubElement(channel, "description").text = "Personal website / Project showcase"
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


def generate_robots():
    output_path = BUILD_FOLDER / "robots.txt"
    output_path.write_text(
        "User-agent: *\nAllow: /\n\n"
        f"Sitemap: {SITE_URL}/sitemap.xml\n",
        encoding="utf-8",
    )
    print(f"✅ robots.txt written to {output_path}")


def generate_sitemap():
    urls = [f"{SITE_URL}/"]
    for post in posts:
        urls.append(f"{SITE_URL}/{post.slug}/")
    for project in projects:
        urls.append(f"{SITE_URL}/{project.slug}/")

    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for loc in urls:
        url_el = ET.SubElement(urlset, "url")
        ET.SubElement(url_el, "loc").text = loc

    output_path = BUILD_FOLDER / "sitemap.xml"
    ET.ElementTree(urlset).write(
        output_path, encoding="utf-8", xml_declaration=True
    )
    print(f"✅ sitemap.xml written to {output_path}")

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Static site generator")
    parser.add_argument(
        "--rss",
        action="store_true",
        help="Generate the RSS feed"
    )
    
    parser.add_argument(
        "--allow_drafts",
        action="store_true",
        help="Include draft posts"
    )

    args = parser.parse_args()
    
    if args.allow_drafts:
        print("⚠️ In draft mode")

    BUILD_FOLDER.mkdir(exist_ok=True)
    
    if POSTS_FOLDER.is_dir():
        build_posts(args)
        print("✅ Generated posts")
    
    if PROJECTS_FOLDER.is_dir():
        build_projects()
        print("✅ Generated projects")
    
    # build index.html
    rendered_index = render_index()
    with open(BUILD_FOLDER / "index.html", "w", encoding="utf-8") as f:
        f.write(rendered_index)
    
    print(f"✅ index.html written to {BUILD_FOLDER / 'index.html'}")
    
    # Generate 404 page
    rendered_404 = render_page(
        "404_template.html",
        "",
        {"title": "Page not found", "summary": "This page does not exist."},
        canonical_path="/404.html",
        og_type="website",
    )
    with open(BUILD_FOLDER / "404.html", "w", encoding="utf-8") as f:
        f.write(rendered_404)
    
    print(f"✅ 404.html written to {BUILD_FOLDER / '404.html'}")

    generate_robots()
    generate_sitemap()
        
    if args.rss:
        generate_rss()
        
    