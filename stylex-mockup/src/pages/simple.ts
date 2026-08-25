import type { Project } from '../data';
import { escapeHtml, externalAttrs, sx } from '../html';
import { styles } from '../styles';

export function renderProject(project: Project): string {
  return `
    <h2${sx(styles.title)}>${escapeHtml(project.title)}</h2>
    <p${sx(styles.paragraph)}>${escapeHtml(project.description)}</p>
    <h3${sx(styles.subheading)}>
      <a href="${escapeHtml(project.link)}"${externalAttrs(project.link)}${sx(styles.link)}>Github Repository ↗</a>
    </h3>
    <hr${sx(styles.rule)} />
  `;
}

export function renderNotFound(): string {
  return `<h4${sx(styles.intro)}>404</h4>`;
}
