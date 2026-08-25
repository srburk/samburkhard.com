import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PostPage from './pages/PostPage';
import ProjectPage from './pages/ProjectPage';
import { posts, projects } from './data/site';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {posts.map((post) => (
          <Route
            key={post.slug}
            path={`/${post.slug}`}
            element={<PostPage post={post} />}
          />
        ))}
        {projects.map((project) => (
          <Route
            key={project.slug}
            path={`/${project.slug}`}
            element={<ProjectPage project={project} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
