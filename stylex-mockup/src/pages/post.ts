import { escapeHtml, sx } from '../html';
import { styles } from '../styles';

function codeBlock(language: string, body: string): string {
  return `
    <figure${sx(styles.figure)}>
      <figcaption${sx(styles.codeHeader)}>
        <span${sx(styles.codeLang)}>${escapeHtml(language)}</span>
      </figcaption>
      <pre${sx(styles.pre)}><code${sx(styles.code)}>${body}</code></pre>
    </figure>
  `;
}

function k(text: string): string {
  return `<span${sx(styles.synKeyword)}>${escapeHtml(text)}</span>`;
}

function s(text: string): string {
  return `<span${sx(styles.synString)}>${escapeHtml(text)}</span>`;
}

function c(text: string): string {
  return `<span${sx(styles.synComment)}>${escapeHtml(text)}</span>`;
}

function f(text: string): string {
  return `<span${sx(styles.synFunction)}>${escapeHtml(text)}</span>`;
}

function cl(text: string): string {
  return `<span${sx(styles.synClass)}>${escapeHtml(text)}</span>`;
}

function attr(name: string, value: string): string {
  return `<span${sx(styles.synAttr)}>${escapeHtml(name)}</span>: <span${sx(styles.synString)}>${escapeHtml(value)}</span>`;
}

function code(text: string): string {
  return `<code${sx(styles.inlineCode)}>${escapeHtml(text)}</code>`;
}

function a(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"${sx(styles.link)}>${escapeHtml(label)}</a>`;
}

export function renderStaticSiteGenPost(): string {
  return `
    <article>
      <h2${sx(styles.title)}>Building a Static Site Generator in Python</h2>
      <p${sx(styles.meta)}>Published 08-16-2025</p>
      <hr${sx(styles.rule)} />

      <h2${sx(styles.heading)}>TLDR</h2>
      <p${sx(styles.paragraph)}>
        I wrote a Python static site generator to automate building HTML files for posts and projects. You can look at my code at
        ${a('https://github.com/srburk/samburkhard.com', 'https://github.com/srburk/samburkhard.com')}.
      </p>

      <h2${sx(styles.heading)}>Motivation</h2>
      <p${sx(styles.paragraph)}>
        I've been wanting to update this website for quite a while, but I have found it frustrating to keep updating the HTML for projects and posts as I add them. The easiest approach here is to integrate an existing static site generator (SSG) to automate the build process for sub HTML pages, but I've resisted doing that because I've found that they are often too heavy for my needs.
      </p>
      <p${sx(styles.paragraph)}>For this reason, I decided to quickly build a simple SSG to accomplish my very limited needs. These are the main features I want:</p>
      <ul${sx(styles.list)}>
        <li${sx(styles.listItem)}><strong>Uses Markdown</strong> – Much simpler than writing in HTML, and ${a('https://daringfireball.net/linked/2025/06/04/apple-notes-markdown', 'Apple Notes now supports markdown export in iOS 26')}.</li>
        <li${sx(styles.listItem)}><strong>Generates an RSS feed</strong> – I'm a big RSS user, even though it's older than me. I find it frustrating when sites don't support it, so it'd be hypocritical if I didn't.</li>
        <li${sx(styles.listItem)}><strong>Simple Templates</strong> – I still need some form of templating for posts like this, so just basic variable injection is sufficient.</li>
      </ul>
      <p${sx(styles.paragraph)}>At the most basic level, write markdown, throw it in a folder with a yaml frontmatter, and build. <strong>That's it.</strong></p>

      <h2${sx(styles.heading)}>Python</h2>
      <p${sx(styles.paragraph)}>
        I chose to use Python because it's easy for quick iteration and fast enough for my purposes. I'm not fully reinventing the wheel here — this project uses
        ${a('https://pyyaml.org/wiki/PyYAML', 'PYAML')},
        ${a('https://pypi.org/project/Markdown/', 'Markdown')}, and
        ${a('https://lxml.de', 'lxml')}.
      </p>
      <p${sx(styles.paragraph)}>So, the script does the following things when run:</p>
      <ol${sx(styles.list)}>
        <li${sx(styles.listItem)}>Look at the ${code('posts')} and ${code('projects')} folders, and generate a new ${code('index.html')} for each using the post and project templates.</li>
        <li${sx(styles.listItem)}>Generate a root ${code('index.html')} using the index template and inject small HTML elements to point to the posts and projects generated in the last step.</li>
        <li${sx(styles.listItem)}>Build an RSS feed from the posts list, and save it as ${code('feed.xml')}</li>
      </ol>
      <p${sx(styles.paragraph)}>Every build artifact is put in the ${code('build')} folder and passed off to Github Pages for deployment.</p>

      <h2${sx(styles.heading)}>Markdown & YAML Frontmatters</h2>
      <p${sx(styles.paragraph)}>Following the design patterns of most SSGs, my posts and projects are defined by YAML frontmatters in markdown files like this:</p>
      ${codeBlock(
        'Yaml',
        `${k('---')}\n${attr('title', "'Building a Static Site Generator in Python'")}\n${attr('date', "'08-16-2025'")}\n${attr('summary', "'Writing a static site generator for this website.'")}\n${attr('draft', 'true')}\n${k('---')}\n\n${c('# Amazing markdown article')}`,
      )}
      <p${sx(styles.paragraph)}>Most of the fields are self-explanatory, but I added the ${code('draft')} field to exclude posts from the build process if the flag ${code('--allow-draft')} is not set.</p>

      <h2${sx(styles.heading)}>Template System</h2>
      <p${sx(styles.paragraph)}>Templates are saved as ${code('.html')} files with ${code('{ variable }')} as the format for injecting variables. Python string formatting handles replacing the curly braces with the actual values.</p>
      ${codeBlock(
        'HTML',
        escapeHtml('<h2 class="title">{title}</h2>\n<p>Published {date}</p>\n<hr />\n{content}'),
      )}
      <p${sx(styles.paragraph)}>Here's my generic template builder I wrote:</p>
      ${codeBlock(
        'Python',
        `${k('def')} ${f('render_page')}(template: ${cl('str')}, html: ${cl('str')}, frontmatter: ${cl('dict')}):\n    ${c('# Load template')}\n    ${k('with')} ${f('open')}(${s('f"./templates/{template}"')}, ${s('"r"')}, encoding=${s('"utf-8"')}) ${k('as')} f:\n        template = f.${f('read')}()`,
      )}
      <p${sx(styles.paragraph)}>I like this approach because it can automatically pull variables from the template and attempt to match them with an equivalent field in the frontmatter.</p>

      <h2${sx(styles.heading)}>Closing</h2>
      <p${sx(styles.paragraph)}>Clearly this is a simple project, and by no means was this an attempt at a full-scale production solution. Don't throw away Hugo or Astro.</p>
      <p${sx(styles.paragraph)}>If you're interested in checking out the code, it's at ${a('https://github.com/srburk/samburkhard.com', 'https://github.com/srburk/samburkhard.com')}.</p>
    </article>
  `;
}
