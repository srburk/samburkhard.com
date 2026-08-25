import { posts, projects } from '../data';
import { escapeHtml, sx } from '../html';
import { styles } from '../styles';

export function renderHome(): string {
  const postItems = posts
    .map(
      (post) => `
        <article>
          <h3${sx(styles.subheading)}>
            ${escapeHtml(post.date)} |
            <a href="/${escapeHtml(post.slug)}"${sx(styles.link)}>${escapeHtml(post.title)} ↗</a>
          </h3>
          <p${sx(styles.paragraph)}>${escapeHtml(post.summary)}</p>
        </article>
      `,
    )
    .join('');

  const projectItems = projects
    .map(
      (project) => `
        <article>
          <h3${sx(styles.subheading)}>
            <a href="/${escapeHtml(project.slug)}"${sx(styles.link)}>${escapeHtml(project.title)} ↗</a>
          </h3>
          <p${sx(styles.paragraph)}>${escapeHtml(project.summary)}</p>
        </article>
      `,
    )
    .join('');

  return `
    <section id="intro">
      <h4${sx(styles.introTitle)}>I'm a student at the University of Cincinnati working towards my Bachelor's and Master's degrees in Computer Engineering.</h4>
      <h4${sx(styles.intro)}>My interests are in iOS development, computer architecture, AI hardware design, and low-level programming.</h4>
    </section>
    <hr${sx(styles.rule)} />
    <section id="posts">
      <h2${sx(styles.heading)}>Posts</h2>
      ${postItems}
    </section>
    <hr${sx(styles.rule)} />
    <section id="projects">
      <h2${sx(styles.heading)}>Projects</h2>
      ${projectItems}
    </section>
    <hr${sx(styles.rule)} />
  `;
}
