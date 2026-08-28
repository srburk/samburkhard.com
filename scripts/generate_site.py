from pathlib import Path
from lxml import etree as ET
from datetime import datetime
from zoneinfo import ZoneInfo
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name
from pygments.util import ClassNotFound
import argparse
import html as html_lib
import re
import string
import markdown
import yaml

# PATHS ARE RELATIVE BC OF CALL FROM Makefile

POSTS_FOLDER = Path("./posts")
PROJECTS_FOLDER = Path("./projects")
BUILD_FOLDER = Path("./build")

# GoatCounter site code. Create the matching site at https://www.goatcounter.com
# (free for personal use). Change this if the code is already taken.
GOATCOUNTER_CODE = "samburkhard"
SITE_DESCRIPTION = "Computer engineering. Posts and projects."

posts = []
projects = []
include_analytics = False

CODE_BLOCK_RE = re.compile(
    r'<pre><code(?: class="([^"]*)")?>(.*?)</code></pre>',
    re.DOTALL,
)
PYGMENTS_FORMATTER = HtmlFormatter(nowrap=True)

class Post:
    def __init__(self, slug: str, title: str, date: str, content: str, description=""):
        self.slug = slug
        self.title = title
        self.date = date
        self.description = description
        self.content = content

class Project:
    def __init__(
        self,
        title: str,
        slug: str,
        summary: str,
        tech: str = "",
        link: str = "",
        order: int = 100,
    ):
        self.title = title
        self.slug = slug
        self.summary = summary
        self.tech = tech
        self.link = link
        self.order = order

def language_from_class(class_attr: str) -> str:
    for cls in class_attr.split():
        if cls.startswith("language-"):
            return cls[len("language-"):]
        if cls.startswith("lang-"):
            return cls[len("lang-"):]
    return ""


def highlight_source(code: str, lang: str) -> tuple[str, str]:
    lexer = None
    if lang:
        try:
            lexer = get_lexer_by_name(lang)
        except ClassNotFound:
            lexer = None

    if lexer is None:
        return html_lib.escape(code), lang

    try:
        return highlight(code, lexer, PYGMENTS_FORMATTER), lexer.name
    except Exception:
        return html_lib.escape(code), lexer.name


def enhance_code_blocks(html: str) -> str:
    def replace_block(match: re.Match) -> str:
        lang = language_from_class(match.group(1) or "")
        source = html_lib.unescape(match.group(2))
        highlighted, display_name = highlight_source(source, lang)

        lang_class = f' class="language-{html_lib.escape(lang, quote=True)}"' if lang else ""
        data_lang = (
            f' data-lang="{html_lib.escape(display_name, quote=True)}"' if display_name else ""
        )
        caption = ""
        if display_name:
            caption = (
                '<figcaption class="code-block__header">'
                f'<span class="code-block__lang">{html_lib.escape(display_name)}</span>'
                "</figcaption>"
            )

        return (
            f'<figure class="code-block"{data_lang}>'
            f"{caption}"
            f"<pre><code{lang_class}>{highlighted}</code></pre>"
            "</figure>"
        )

    return CODE_BLOCK_RE.sub(replace_block, html)


def markdown_to_html(md_text: str) -> str:
    return enhance_code_blocks(markdown.markdown(md_text, extensions=["fenced_code"]))


def goatcounter_snippet() -> str:
    return (
        f'<script data-goatcounter="https://{GOATCOUNTER_CODE}.goatcounter.com/count"\n'
        '        async src="https://gc.zgo.at/count.js"></script>'
    )


def iso_date(date_str: str) -> str:
    if not date_str:
        return ""
    for fmt in ("%m-%d-%Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(str(date_str), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return str(date_str)


def render_in_base(title: str, content: str, description: str = "") -> str:
    with open("./templates/base_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    meta_description = description.strip() if description else SITE_DESCRIPTION

    rendered_page = template.format(
        title=html_lib.escape(title, quote=True),
        meta_description=html_lib.escape(meta_description, quote=True),
        copyright_date=str(datetime.now().year),
        content=content,
        analytics=goatcounter_snippet() if include_analytics else "",
    )

    return rendered_page

def render_index():

    def render_post_link(post: Post) -> str:
        title = html_lib.escape(post.title or "")
        summary = html_lib.escape(post.description or "")
        date = iso_date(post.date)
        href = html_lib.escape(f"/{post.slug}", quote=True)
        return (
            f'<article class="post">'
            f'<p class="meta"><time datetime="{html_lib.escape(date, quote=True)}">{html_lib.escape(date)}</time></p>'
            f'<a class="entry-title" href="{href}">{title}</a>'
            f'<p class="summary">{summary}</p>'
            f"</article>"
        )

    def render_project_link(project: Project) -> str:
        title = html_lib.escape(project.title or "")
        summary = html_lib.escape(project.summary or "")
        tech = html_lib.escape(project.tech or "")
        href = html_lib.escape(f"/{project.slug}", quote=True)
        tech_html = f'<p class="tech">{tech}</p>' if tech else ""
        return (
            f'<article class="project">'
            f'<a class="entry-title" href="{href}">{title}</a>'
            f'<p class="summary">{summary}</p>'
            f"{tech_html}"
            f"</article>"
        )

    sorted_posts = sorted(posts, key=lambda d: d.date, reverse=True)
    sorted_projects = sorted(projects, key=lambda p: (p.order, p.title or ""))
    rendered_post_links = [render_post_link(x) for x in sorted_posts]
    rendered_project_links = [render_project_link(x) for x in sorted_projects]

    with open("./templates/index_template.html", "r", encoding="utf-8") as f:
        template = f.read()

    rendered_content = template.format(
        posts="".join(rendered_post_links),
        projects="".join(rendered_project_links),
    )

    return render_in_base("Sam Burkhard", rendered_content, SITE_DESCRIPTION)

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

    page_title = frontmatter.get("title", "Sam Burkhard")
    page_description = (
        frontmatter.get("summary")
        or frontmatter.get("description")
        or SITE_DESCRIPTION
    )
    return render_in_base(page_title, rendered_content, page_description)

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
                    html = markdown_to_html(parts[2])
                    
                    if front_matter.get("draft") and not args.allow_drafts:
                        print(f"Skipping draft post: {front_matter.get('title')}")
                        continue
                                                                                
                    rendered_page = render_page("post_template.html", html, front_matter)
                    
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
                    html = markdown_to_html(parts[2])
                    
                    if front_matter.get("draft") and not args.allow_drafts:
                        print(f"Skipping draft project: {front_matter.get('title')}")
                        continue
                                                                                
                    rendered_page = render_page("project_template.html", html, front_matter)
                    
                    # write each to a different folder so github pages routes automatically
                    rendered_page_path = BUILD_FOLDER / file_path.stem
                    rendered_page_path.mkdir(exist_ok=True)
                    
                    with open(rendered_page_path / "index.html", "w", encoding="utf-8") as f:
                        f.write(rendered_page)
                    
                    projects.append(
                        Project(
                            title=front_matter.get("title"),
                            slug=file_path.stem,
                            summary=front_matter.get("summary", ""),
                            tech=front_matter.get("tech", ""),
                            link=front_matter.get("link", ""),
                            order=int(front_matter.get("order", 100)),
                        )
                    )
                    
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
    include_analytics = not args.allow_drafts

    if args.allow_drafts:
        print("⚠️ In draft mode")
    if include_analytics:
        print(f"📊 Analytics enabled ({GOATCOUNTER_CODE}.goatcounter.com)")

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
    rendered_404 = render_page("404_template.html", "", {"title": "404", "summary": "Page not found."})
    with open(BUILD_FOLDER / "404.html", "w", encoding="utf-8") as f:
        f.write(rendered_404)
    
    print(f"✅ 404.html written to {BUILD_FOLDER / '404.html'}")
        
    if args.rss:
        generate_rss()
        
    