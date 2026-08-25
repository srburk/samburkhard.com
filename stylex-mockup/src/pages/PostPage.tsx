import type { Post } from '../data/types';

export default function PostPage({ post }: { post: Post }) {
  return <article>{post.content}</article>;
}
