export const socialLinks = [
  { href: 'https://github.com/srburk', label: 'GitHub' },
  {
    href: 'https://www.linkedin.com/in/sam-burkhard-712734223/',
    label: 'LinkedIn',
  },
  { href: 'https://x.com/samrburkhard', label: 'X' },
  { href: 'mailto:burkhas4@mail.uc.edu', label: 'Email' },
] as const;

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  link: string;
};

export const posts: Post[] = [
  {
    slug: 'static-site-gen',
    title: 'Building a Static Site Generator in Python',
    date: '08-16-2025',
    summary: 'Writing a static site generator for this website.',
  },
];

export const projects: Project[] = [
  {
    slug: 'rf-messenger',
    title: 'Embedded RF Messenger',
    summary:
      'STM32W-based wireless messaging device with FreeRTOS real-time processing, and integrated I2C/SPI interfaces for keyboard and display.',
    description: 'STM32 C FreeRTOS',
    link: 'https://github.com/srburk/RF-Messenger',
  },
  {
    slug: 'shipments',
    title: 'Shipments',
    summary:
      'iOS application built with Objective-C and UIKit in 2 weeks for solving graph-based concurrency problem with visual feedback.',
    description:
      'The objective of this project was to develop an iOS app in Objective-C with UIKit. It should accept 2 states as input and calculate the cheapest shipping route along the contiguous United States. The government has imposed a fee on crossing state borders that I allow the user to set, and the fuel cost from state to state can vary, requiring a third-party API to get access.',
    link: 'https://github.com/srburk/StatelyShipments',
  },
];
