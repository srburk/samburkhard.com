import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, fonts } from '../tokens.stylex';

const styles = stylex.create({
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
  header: {
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    paddingBlock: '0.55em',
    paddingInline: '1.1em',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.codeBorder,
  },
  lang: {
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
  comment: {
    color: colors.synComment,
    fontStyle: 'italic',
  },
  keyword: {
    color: colors.synKeyword,
    fontWeight: 500,
  },
  string: {
    color: colors.synString,
  },
  number: {
    color: colors.synNumber,
  },
  fn: {
    color: colors.synFunction,
  },
  cls: {
    color: colors.synClass,
  },
  builtin: {
    color: colors.synBuiltin,
  },
  tag: {
    color: colors.synTag,
  },
  attr: {
    color: colors.synAttr,
  },
  error: {
    color: colors.synError,
  },
});

export const syn = {
  comment: styles.comment,
  keyword: styles.keyword,
  string: styles.string,
  number: styles.number,
  fn: styles.fn,
  cls: styles.cls,
  builtin: styles.builtin,
  tag: styles.tag,
  attr: styles.attr,
  error: styles.error,
};

type CodeBlockProps = {
  language: string;
  children: ReactNode;
};

export default function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <figure {...stylex.props(styles.figure)}>
      <figcaption {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.lang)}>{language}</span>
      </figcaption>
      <pre {...stylex.props(styles.pre)}>
        <code {...stylex.props(styles.code)}>{children}</code>
      </pre>
    </figure>
  );
}
