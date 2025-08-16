from pathlib import Path
import markdown
import yaml

# PATHS ARE RELATIVE BC OF CALL FROM Makefile

POSTS_FOLDER = Path("./posts")
BUILD_FOLDER = Path("./build")

def render_page(html, frontmatter):
    # write to build folder
    # Load template
    with open("./post_template.html", "r", encoding="utf-8") as f:
        template = f.read()
        
    rendered_page = template.format(
        title=frontmatter.get("title"),
        date=frontmatter.get("date"),
        content=html # fills body
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
                    
                    rendered_page = render_page(html, front_matter)
                    
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
        print("Building posts...")
        build_posts()
        
    