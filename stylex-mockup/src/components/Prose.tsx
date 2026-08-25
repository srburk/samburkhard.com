import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, fonts } from '../tokens.stylex';

const styles = stylex.create({
  title: {
    marginTop: 0,
    fontWeight: 600,
    fontSize: '1.125rem',
  },
  heading: {
    fontWeight: 600,
    fontSize: '1.125rem',
  },
  subheading: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  intro: {
    fontWeight: 400,
    fontSize: '1rem',
  },
  paragraph: {
    fontWeight: 400,
    fontSize: '0.85rem',
    marginTop: '-0.5rem',
  },
  meta: {
    fontWeight: 400,
    fontSize: '0.85rem',
  },
  list: {
    margin: 0,
    paddingLeft: '1em',
  },
  listItem: {
    fontWeight: 400,
    fontSize: '0.85rem',
  },
  link: {
    textDecorationLine: 'none',
    color: colors.accent,
    fontWeight: 500,
  },
  rule: {
    display: 'block',
    height: 1,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'currentColor',
    opacity: 0.15,
    marginBlock: 24,
    marginInline: 0,
  },
  inlineCode: {
    fontFamily: fonts.mono,
    backgroundColor: colors.codeBackground,
    paddingBlock: '0.15em',
    paddingInline: '0.4em',
    borderRadius: '0.3em',
    fontSize: '0.8em',
  },
});

type ChildrenProps = { children: ReactNode };

export function Title({ children }: ChildrenProps) {
  return <h2 {...stylex.props(styles.title)}>{children}</h2>;
}

export function H2({ children }: ChildrenProps) {
  return <h2 {...stylex.props(styles.heading)}>{children}</h2>;
}

export function H3({ children }: ChildrenProps) {
  return <h3 {...stylex.props(styles.subheading)}>{children}</h3>;
}

export function H4({ children }: ChildrenProps) {
  return <h4 {...stylex.props(styles.intro)}>{children}</h4>;
}

export function P({ children }: ChildrenProps) {
  return <p {...stylex.props(styles.paragraph)}>{children}</p>;
}

export function Meta({ children }: ChildrenProps) {
  return <p {...stylex.props(styles.meta)}>{children}</p>;
}

export function Ul({ children }: ChildrenProps) {
  return <ul {...stylex.props(styles.list)}>{children}</ul>;
}

export function Ol({ children }: ChildrenProps) {
  return <ol {...stylex.props(styles.list)}>{children}</ol>;
}

export function Li({ children }: ChildrenProps) {
  return <li {...stylex.props(styles.listItem)}>{children}</li>;
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...stylex.props(styles.link)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

export function Hr() {
  return <hr {...stylex.props(styles.rule)} />;
}

export function Code({ children }: ChildrenProps) {
  return <code {...stylex.props(styles.inlineCode)}>{children}</code>;
}
