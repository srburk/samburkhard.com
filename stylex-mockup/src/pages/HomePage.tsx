import { Link } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens.stylex';
import { H2, H4, Hr, P } from '../components/Prose';
import { posts, projects } from '../data/site';

const styles = stylex.create({
  introTitle: {
    marginTop: 0,
    fontWeight: 400,
    fontSize: '1rem',
  },
  heading: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  link: {
    textDecorationLine: 'none',
    color: colors.accent,
    fontWeight: 500,
  },
});

export default function HomePage() {
  return (
    <>
      <section id="intro">
        <h4 {...stylex.props(styles.introTitle)}>
          I&apos;m a student at the University of Cincinnati working towards my
          Bachelor&apos;s and Master&apos;s degrees in Computer Engineering.
        </h4>
        <H4>
          My interests are in iOS development, computer architecture, AI
          hardware design, and low-level programming.
        </H4>
      </section>

      <Hr />

      <section id="posts">
        <H2>Posts</H2>
        {posts.map((post) => (
          <article key={post.slug}>
            <h3 {...stylex.props(styles.heading)}>
              {post.date} |{' '}
              <Link to={`/${post.slug}`} {...stylex.props(styles.link)}>
                {post.title} ↗
              </Link>
            </h3>
            <P>{post.summary}</P>
          </article>
        ))}
      </section>

      <Hr />

      <section id="projects">
        <H2>Projects</H2>
        {projects.map((project) => (
          <article key={project.slug}>
            <h3 {...stylex.props(styles.heading)}>
              <Link to={`/${project.slug}`} {...stylex.props(styles.link)}>
                {project.title} ↗
              </Link>
            </h3>
            <P>{project.summary}</P>
          </article>
        ))}
      </section>

      <Hr />
    </>
  );
}
