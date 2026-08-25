import { NavLink, Outlet } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { colors, fonts } from '../tokens.stylex';
import { socialLinks } from '../data/site';

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    padding: 'clamp(16px, 4vw, 4em)',
    lineHeight: 1.8,
    fontSize: 18,
    fontFamily: fonts.sans,
    backgroundColor: colors.background,
    color: colors.text,
    wordWrap: 'break-word',
  },
  layout: {
    display: {
      default: 'grid',
      '@media (max-width: 1100px)': 'block',
    },
    gridTemplateColumns: '1fr minmax(0, 64ch) 1fr',
    columnGap: 100,
    minHeight: '100vh',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: {
      default: 'sticky',
      '@media (max-width: 1100px)': 'static',
    },
    top: 24,
    width: {
      default: 'max-content',
      '@media (max-width: 1100px)': 'auto',
    },
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginInline: {
      default: null,
      '@media (max-width: 1100px)': 'auto',
    },
    marginBottom: {
      default: null,
      '@media (max-width: 1100px)': 16,
    },
    maxWidth: {
      default: null,
      '@media (max-width: 1100px)': '64ch',
    },
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-start',
  },
  wordmark: {
    margin: 0,
    fontWeight: 600,
    fontSize: '1.125rem',
  },
  wordmarkLink: {
    textDecorationLine: 'none',
    color: colors.accent,
  },
  social: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  socialLink: {
    display: 'block',
    color: colors.accent,
    textDecorationLine: 'underline',
    textUnderlineOffset: '0.15em',
    textDecorationThickness: {
      default: '0.08em',
      ':hover': '0.12em',
    },
  },
  main: {
    gridColumn: '2',
    marginBottom: '4em',
    maxWidth: {
      default: null,
      '@media (max-width: 1100px)': '64ch',
    },
    marginInline: {
      default: null,
      '@media (max-width: 1100px)': 'auto',
    },
  },
  footer: {
    fontWeight: 300,
    fontSize: '0.9rem',
  },
  mockNote: {
    fontWeight: 400,
    fontSize: '0.75rem',
    opacity: 0.55,
    marginTop: '0.35rem',
  },
});

export default function Layout() {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.layout)}>
        <aside {...stylex.props(styles.sidebar)}>
          <div {...stylex.props(styles.sidebarHeader)}>
            <h1 {...stylex.props(styles.wordmark)}>
              <NavLink to="/" {...stylex.props(styles.wordmarkLink)}>
                ⬥ Sam Burkhard
              </NavLink>
            </h1>
          </div>
          <nav {...stylex.props(styles.social)} aria-label="Social">
            {socialLinks.map((link) => {
              const external = link.href.startsWith('http');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  {...(external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  {...stylex.props(styles.socialLink)}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </aside>
        <main {...stylex.props(styles.main)}>
          <Outlet />
          <footer>
            <p {...stylex.props(styles.footer)}>
              © {new Date().getFullYear()} Sam Burkhard
            </p>
            <p {...stylex.props(styles.mockNote)}>StyleX mockup</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
