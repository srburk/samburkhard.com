import { posts, projects } from './data';
import { renderLayout } from './layout';
import { renderHome } from './pages/home';
import { renderStaticSiteGenPost } from './pages/post';
import { renderNotFound, renderProject } from './pages/simple';
import './index.css';

function normalizePath(pathname: string): string {
  if (pathname === '/index.html') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function pageFor(pathname: string): { title: string; html: string } {
  const path = normalizePath(pathname);

  if (path === '/') {
    return { title: 'Sam Burkhard', html: renderHome() };
  }

  const post = posts.find((item) => `/${item.slug}` === path);
  if (post) {
    return { title: post.title, html: renderStaticSiteGenPost() };
  }

  const project = projects.find((item) => `/${item.slug}` === path);
  if (project) {
    return { title: project.title, html: renderProject(project) };
  }

  return { title: '404', html: renderNotFound() };
}

function render(pathname: string = location.pathname): void {
  const page = pageFor(pathname);
  document.title = page.title;
  const site = document.getElementById('site');
  if (!site) return;
  site.innerHTML = renderLayout(page.html);
}

function isInternalLink(anchor: HTMLAnchorElement): boolean {
  return (
    anchor.origin === location.origin &&
    !anchor.hasAttribute('target') &&
    !anchor.getAttribute('href')?.startsWith('mailto:')
  );
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest('a');
  if (!(anchor instanceof HTMLAnchorElement) || !isInternalLink(anchor)) {
    return;
  }
  event.preventDefault();
  if (anchor.pathname === location.pathname) return;
  history.pushState({}, '', anchor.pathname);
  render(anchor.pathname);
});

window.addEventListener('popstate', () => {
  render(location.pathname);
});

render();
