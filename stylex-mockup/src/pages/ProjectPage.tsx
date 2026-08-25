import { A, H3, Hr, P, Title } from '../components/Prose';
import type { Project } from '../data/types';

export default function ProjectPage({ project }: { project: Project }) {
  return (
    <>
      <Title>{project.title}</Title>
      <P>{project.description}</P>
      <H3>
        <A href={project.link}>Github Repository ↗</A>
      </H3>
      <Hr />
    </>
  );
}
