import type { ReactNode } from 'react';

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: ReactNode;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  link: string;
};

export const socialLinks = [
  { href: 'https://github.com/srburk', label: 'GitHub' },
  {
    href: 'https://www.linkedin.com/in/sam-burkhard-712734223/',
    label: 'LinkedIn',
  },
  { href: 'https://x.com/samrburkhard', label: 'X' },
  { href: 'mailto:burkhas4@mail.uc.edu', label: 'Email' },
] as const;
