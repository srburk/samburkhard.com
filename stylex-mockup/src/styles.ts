import * as stylex from '@stylexjs/stylex';
import { colors, fonts } from './tokens.stylex';

export const styles = stylex.create({
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
  introTitle: {
    marginTop: 0,
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
  figure: {
    marginBlock: '1.5em',
    marginInline: 0,
    padding: 0,
    backgroundColor: colors.codeBackground,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.codeBorder,
    borderRadius: '0.6em',
    overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    paddingBlock: '0.55em',
    paddingInline: '1.1em',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.codeBorder,
  },
  codeLang: {
    fontSize: '0.68rem',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.codeLang,
  },
  pre: {
    margin: 0,
    overflowX: 'auto',
  },
  code: {
    display: 'block',
    paddingBlock: '1em',
    paddingInline: '1.15em',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    overflow: 'visible',
    lineHeight: 1.5,
    fontSize: '0.78rem',
    fontFamily: fonts.mono,
    tabSize: 4,
    color: colors.text,
  },
  synComment: {
    color: colors.synComment,
    fontStyle: 'italic',
  },
  synKeyword: {
    color: colors.synKeyword,
    fontWeight: 500,
  },
  synString: {
    color: colors.synString,
  },
  synFunction: {
    color: colors.synFunction,
  },
  synClass: {
    color: colors.synClass,
  },
  synAttr: {
    color: colors.synAttr,
  },
});
