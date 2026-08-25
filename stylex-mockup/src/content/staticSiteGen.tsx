import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import CodeBlock, { syn } from '../components/CodeBlock';
import { A, Code, H2, Hr, Li, Meta, Ol, P, Title, Ul } from '../components/Prose';

function K({ children }: { children: ReactNode }) {
  return <span {...stylex.props(syn.keyword)}>{children}</span>;
}

function S({ children }: { children: ReactNode }) {
  return <span {...stylex.props(syn.string)}>{children}</span>;
}

function C({ children }: { children: ReactNode }) {
  return <span {...stylex.props(syn.comment)}>{children}</span>;
}

function F({ children }: { children: ReactNode }) {
  return <span {...stylex.props(syn.fn)}>{children}</span>;
}

function Cl({ children }: { children: ReactNode }) {
  return <span {...stylex.props(syn.cls)}>{children}</span>;
}

function AttrLine({ name, value }: { name: string; value: string }) {
  return (
    <>
      <span {...stylex.props(syn.attr)}>{name}</span>
      {': '}
      <span {...stylex.props(syn.string)}>{value}</span>
    </>
  );
}

export const staticSiteGenPost = (
  <>
    <Title>Building a Static Site Generator in Python</Title>
    <Meta>Published 08-16-2025</Meta>
    <Hr />

    <H2>TLDR</H2>
    <P>
      I wrote a Python static site generator to automate building HTML files for
      posts and projects. You can look at my code at{' '}
      <A href="https://github.com/srburk/samburkhard.com">
        https://github.com/srburk/samburkhard.com
      </A>
      .
    </P>

    <H2>Motivation</H2>
    <P>
      I&apos;ve been wanting to update this website for quite a while, but I
      have found it frustrating to keep updating the HTML for projects and posts
      as I add them. The easiest approach here is to integrate an existing
      static site generator (SSG) to automate the build process for sub HTML
      pages, but I&apos;ve resisted doing that because I&apos;ve found that they
      are often too heavy for my needs.
    </P>
    <P>
      For this reason, I decided to quickly build a simple SSG to accomplish my
      very limited needs. These are the main features I want:
    </P>
    <Ul>
      <Li>
        <strong>Uses Markdown</strong> – Much simpler than writing in HTML, and{' '}
        <A href="https://daringfireball.net/linked/2025/06/04/apple-notes-markdown">
          Apple Notes now supports markdown export in iOS 26
        </A>
        .
      </Li>
      <Li>
        <strong>Generates an RSS feed</strong> – I&apos;m a big RSS user, even
        though it&apos;s older than me. I find it frustrating when sites
        don&apos;t support it, so it&apos;d be hypocritical if I didn&apos;t.
      </Li>
      <Li>
        <strong>Simple Templates</strong> – I still need some form of templating
        for posts like this, so just basic variable injection is sufficient.
      </Li>
    </Ul>
    <P>
      At the most basic level, write markdown, throw it in a folder with a yaml
      frontmatter, and build. <strong>That&apos;s it.</strong>
    </P>

    <H2>Python</H2>
    <P>
      I chose to use Python because it&apos;s easy for quick iteration and fast
      enough for my purposes. I&apos;m not fully reinventing the wheel here —
      this project uses{' '}
      <A href="https://pyyaml.org/wiki/PyYAML">PYAML</A>,{' '}
      <A href="https://pypi.org/project/Markdown/">Markdown</A>, and{' '}
      <A href="https://lxml.de">lxml</A>.
    </P>
    <P>So, the script does the following things when run:</P>
    <Ol>
      <Li>
        Look at the <Code>posts</Code> and <Code>projects</Code> folders, and
        generate a new <Code>index.html</Code> for each using the post and
        project templates.
      </Li>
      <Li>
        Generate a root <Code>index.html</Code> using the index template and
        inject small HTML elements to point to the posts and projects generated
        in the last step.
      </Li>
      <Li>
        Build an RSS feed from the posts list, and save it as{' '}
        <Code>feed.xml</Code>
      </Li>
    </Ol>
    <P>
      Every build artifact is put in the <Code>build</Code> folder and passed
      off to Github Pages for deployment.
    </P>

    <H2>Markdown & YAML Frontmatters</H2>
    <P>
      Following the design patterns of most SSGs, my posts and projects are
      defined by YAML frontmatters in markdown files like this:
    </P>
    <CodeBlock language="Yaml">
      <K>---</K>
      {'\n'}
      <AttrLine name="title" value="'Building a Static Site Generator in Python'" />
      {'\n'}
      <AttrLine name="date" value="'08-16-2025'" />
      {'\n'}
      <AttrLine name="summary" value="'Writing a static site generator for this website.'" />
      {'\n'}
      <AttrLine name="draft" value="true" />
      {'\n'}
      <K>---</K>
      {'\n\n'}
      <C># Amazing markdown article</C>
    </CodeBlock>
    <P>
      Most of the fields are self-explanatory, but I added the <Code>draft</Code>{' '}
      field to exclude posts from the build process if the flag{' '}
      <Code>--allow-draft</Code> is not set.
    </P>

    <H2>Template System</H2>
    <P>
      Templates are saved as <Code>.html</Code> files with{' '}
      <Code>{'{ variable }'}</Code> as the format for injecting variables.
      Python string formatting handles replacing the curly braces with the
      actual values.
    </P>
    <CodeBlock language="HTML">
      {'<h2 class="title">{title}</h2>\n'}
      {'<p>Published {date}</p>\n'}
      {'<hr />\n'}
      {'{content}'}
    </CodeBlock>
    <P>Here&apos;s my generic template builder I wrote:</P>
    <CodeBlock language="Python">
      <K>def</K> <F>render_page</F>(template: <Cl>str</Cl>, html: <Cl>str</Cl>,
      frontmatter: <Cl>dict</Cl>):{'\n'}
      {'    '}
      <C># Load template</C>
      {'\n'}
      {'    '}
      <K>with</K> <F>open</F>(
      <S>{'f"./templates/{template}"'}</S>, <S>"r"</S>, encoding=
      <S>"utf-8"</S>) <K>as</K> f:{'\n'}
      {'        '}template = f.<F>read</F>()
    </CodeBlock>
    <P>
      I like this approach because it can automatically pull variables from the
      template and attempt to match them with an equivalent field in the
      frontmatter.
    </P>

    <H2>Closing</H2>
    <P>
      Clearly this is a simple project, and by no means was this an attempt at a
      full-scale production solution. Don&apos;t throw away Hugo or Astro.
    </P>
    <P>
      If you&apos;re interested in checking out the code, it&apos;s at{' '}
      <A href="https://github.com/srburk/samburkhard.com">
        https://github.com/srburk/samburkhard.com
      </A>
      .
    </P>
  </>
);
