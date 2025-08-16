from pathlib import Path
from lxml import etree as ET
from datetime import datetime
import argparse
import string
import markdown
import yaml

# PATHS ARE RELATIVE BC OF CALL FROM Makefile

POSTS_FOLDER = Path("./posts")
PROJECTS_FOLDER = Path("./projects")
BUILD_FOLDER = Path("./build")

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
    def __init__(self, title: str, summary: str, link: str = ""):
        self.title = title
        self.summary = summary
        self.link = link

def render_in_base(title: str, content: str) -> str:
    with open("./templates/base_template.html", "r", encoding="utf-8") as f:
        template = f.read() 
    
    rendered_page = template.format(
        title=title,
        copyright_date=str(datetime.now().year),
        content=content
    )
    
    return rendered_page

def render_index():

    def render_post_link(post: Post) -> str:
        return f"<article class='post'><h3>{post.date} | <a href='/{post.slug}'>{post.title} ↗</a></h3><p>{post.description}</p></article>".strip()
    
    def render_project_link(project: Project) -> str:
        return f"<article class='project'><h3><a href='{project.link}' target='_blank' rel='noopener noreferrer'>{project.title} ↗</a></h3><p>{project.summary}</p></article>".strip()
    
    sorted_posts = sorted(posts, key=lambda d: d.date, reverse=True)
    rendered_post_links = [render_post_link(x) for x in sorted_posts]
    rendered_project_links = [render_project_link(x) for x in projects]
    
    with open("./templates/index_template.html", "r", encoding="utf-8") as f:
        template = f.read()
        
    rendered_content = template.format(
        posts=''.join(rendered_post_links),
        projects=''.join(rendered_project_links)
    )
    
    return render_in_base("Sam Burkhard", rendered_content)

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
                    html = markdown.markdown(parts[2])
                    
                    projects.append(Project(front_matter.get("title"), front_matter.get("summary"), front_matter.get("link")))
                    
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
    ET.SubElement(channel, "description").text = "Personal website / project showcase"

    for post in sorted(posts, key=lambda p: p.date, reverse=True):
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = post.title
        ET.SubElement(item, "link").text = f"{site_link}/{post.slug}"
        ET.SubElement(item, "guid").text = f"{site_link}/{post.slug}"
        ET.SubElement(item, "description").text = post.description
        
        content_encoded = ET.SubElement(item, f"{{{NS_CONTENT}}}encoded")
        content_encoded.text = ET.CDATA(post.content)

        pub_date = datetime.strptime(post.date, "%m-%d-%Y")
        ET.SubElement(item, "pubDate").text = pub_date.strftime(
            "%a, %d %b %Y %H:%M:%S +0000"
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
    rendered_404 = render_page("404_template.html", "", {})
    with open(BUILD_FOLDER / "404.html", "w", encoding="utf-8") as f:
        f.write(rendered_404)
    
    print(f"✅ 404.html written to {BUILD_FOLDER / '404.html'}")
        
    if args.rss:
        generate_rss()
        
    