from pathlib import Path
import markdown
import yaml

# PATHS ARE RELATIVE BC OF CALL FROM Makefile

POSTS_FOLDER = Path("./posts")
BUILD_FOLDER = Path("./build")

posts = []

def render_index():

    def render_post_link(path: str, title: str) -> str:
        return f"<article class='post'><h3><a href='/{path}'>{title}</a></h3></article>".strip()
    
    rendered_post_links = [render_post_link(x[0], x[1]) for x in posts]
    print(rendered_post_links)
    
    with open("./templates/index_template.html", "r", encoding="utf-8") as f:
        template = f.read()
    
    rendered_content = template.format(
        posts=''.join(rendered_post_links)
    )
    
    with open("./templates/base_template.html", "r", encoding="utf-8") as f:
        template = f.read() 
    
    rendered_page = template.format(
        title="Sam Burkhard",
        content=rendered_content
    )
    
    return rendered_page

def render_page(template: str, html: str, frontmatter: dict):
    # write to build folder
    # Load template
    with open(f"./templates/{template}", "r", encoding="utf-8") as f:
        template = f.read()
        
    rendered_content = template.format(
        date=frontmatter.get("date"),
        title=frontmatter.get("title"),
        content=html # fills body
    )
    
    with open("./templates/base_template.html", "r", encoding="utf-8") as f:
        template = f.read() 
    
    rendered_page = template.format(
        title=frontmatter.get("title"),
        content=rendered_content
    )
    
    return rendered_page

def build_posts():

    POSTS_FOLDER.mkdir(exist_ok=True)

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
                    html = markdown.markdown(parts[2])
                    
                    posts.append((file_path.stem, front_matter.get("title")))
                    
                    rendered_page = render_page("post_template.html", html, front_matter)
                    
                    # write each to a different folder so github pages routes automatically
                    rendered_page_path = BUILD_FOLDER / file_path.stem
                    rendered_page_path.mkdir(exist_ok=True)
                    
                    with open(rendered_page_path / "index.html", "w", encoding="utf-8") as f:
                        f.write(rendered_page)
                    
                except yaml.YAMLError as e:
                    print("YAML parsing error:", e)
                except Exception as e:
                    print("Other error:", e)

if __name__ == "__main__":

    BUILD_FOLDER.mkdir(exist_ok=True)
    
    if POSTS_FOLDER.is_dir():
        print("Generating posts...")
        build_posts()
    
    # build index.html
    print("Generating index...")
    rendered_index = render_index()
    with open(BUILD_FOLDER / "index.html", "w", encoding="utf-8") as f:
        f.write(rendered_index)
        
    