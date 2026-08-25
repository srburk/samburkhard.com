import { socialLinks } from './data';
import { escapeHtml, externalAttrs, sx } from './html';
import { styles } from './styles';

export function renderLayout(content: string): string {
  const year = new Date().getFullYear();
  const social = socialLinks
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}"${externalAttrs(link.href)}${sx(styles.socialLink)}>${escapeHtml(link.label)}</a>`,
    )
    .join('');

  return `
    <div${sx(styles.page)}>
      <div${sx(styles.layout)}>
        <aside${sx(styles.sidebar)}>
          <div${sx(styles.sidebarHeader)}>
            <h1${sx(styles.wordmark)}>
              <a href="/"${sx(styles.wordmarkLink)}>⬥ Sam Burkhard</a>
            </h1>
          </div>
          <nav${sx(styles.social)} aria-label="Social">${social}</nav>
        </aside>
        <main${sx(styles.main)}>
          ${content}
          <footer>
            <p${sx(styles.footer)}>© ${year} Sam Burkhard</p>
            <p${sx(styles.mockNote)}>StyleX mockup</p>
          </footer>
        </main>
      </div>
    </div>
  `;
}
