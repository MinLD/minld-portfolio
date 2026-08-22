import avtImage from '@/assets/images/avt.jpeg'
import cloudImage from '@/assets/images/cloud.jpg'
import flowerImage from '@/assets/images/hoacuc.jpg'
import dog from '@/assets/images/dog.jpg'
export const aboutSections = [
  {
    id: 'story',
    eyebrow: '01',
    label: 'MY STORY',
    title: 'My story',
    image: avtImage,
    alt: 'Portrait photo of Luân Đỗ',
    body: [
      'I am Luân Đỗ - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician, driven by ambition, curiosity, and the desire to turn ideas into something real. Here, I reflect on the process behind my work, the ideas that shape it, and the challenges that help me improve. This site isn’t just about finished results, but about progress, exploration, and becoming better over time.',
      'I’ve always been curious about how things work and how ideas can be shaped into something meaningful. I enjoy learning new things, challenging myself, and constantly pushing beyond what I already know. Most of my skills - in technology, design, and art - come from being self-taught. They are not gifts I was born with, but results of long nights, repeated practice, and the willingness to keep going even when things feel difficult. I would describe myself as ambitious and hardworking. I care deeply about growth, not instant results. I believe real talent is built over time, through discipline, patience, and consistency. That belief guides how I learn, how I work, and how I approach both my career and my personal interests. Music has been an important part of my life for more than five years. As a guitarist, I’ve had opportunities to perform at several live shows, and music continues to shape how I think and feel. Beyond music, I’m deeply drawn to filmmaking and photography. I love capturing moments and sharing how I see the world through the lens - quiet details, emotions, and stories that often go unnoticed. Life can be busy with studying and work, but I always make space for the things that matter to me. Some days are spent practicing guitar for hours; other nights are spent coding late, experimenting, and learning. Creating - whether through code, music, or visuals - is not just a hobby for me, it’s how I understand myself and the world around me. I believe the future belongs to those who believe in their dreams and are brave enough to work for them. This space is where I share pieces of that journey.',
    ],
    quote: 'Reliable software is built from small decisions repeated well.',
    stats: [
      { label: 'Focus', value: 'Backend / QA' },
      { label: 'Style', value: 'Practical systems' },
    ],
  },
  {
    id: 'experience',
    eyebrow: '02',
    label: 'EDUCATION & EXPERIENCE',
    title: 'Education & Experience.',
    image: cloudImage,
    alt: 'Cloudy sky photo',
    timeline: [
      {
        period: '2023 - Present',
        title: 'Nguyen Tat Thanh University',
        role: 'Software Engineering Technology',
        text: 'GPA: 3.4 / 4.0. Top 3 University Software Engineering Competition, academic year 2024-2025.',
      },
      {
        period: '2026 - Present',
        title: 'Academic Project Lifecycle Management Platform',
        role: 'Full-stack Developer',
        text: 'Built thesis workflow platform with Next.js, TypeScript, Express.js, PostgreSQL, Prisma, RBAC, and MinIO uploads.',
      },
      {
        period: 'May 2026 - Present',
        title: 'Lutest - Automated Web UI Testing',
        role: 'Full-stack Developer',
        text: 'Built local-first CLI and worker to analyze routes, components, APIs, screenshots, accessibility, and UI behavior.',
      },
    ],
  },
  {
    id: 'skills',
    eyebrow: '03',
    label: 'SKILLS',
    title: 'Skills.',
    image: flowerImage,
    alt: 'White chrysanthemum flowers',
    groups: [
      {
        name: 'Programming Languages',
        items: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL'],
      },
      { name: 'Frontend', items: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'HTML5', 'CSS3'] },
      {
        name: 'Backend',
        items: [
          'Node.js',
          'Express.js',
          'Flask',
          'RESTful API',
          'JWT',
          'OAuth 2.0',
          'RBAC',
          'Socket.IO',
        ],
      },
      {
        name: 'Database',
        items: [
          'PostgreSQL',
          'MySQL',
          'Prisma',
          'SQLAlchemy',
          'MinIO',
          'Cloudinary',
          'Redis',
          'Meilisearch',
        ],
      },
      {
        name: 'DevOps & Tools',
        items: ['Docker', 'Nginx', 'Git', 'GitHub', 'GitHub Actions', 'CI/CD'],
      },
      {
        name: 'Testing & Quality',
        items: ['Playwright', 'API Testing', 'UI Automation', 'Test Planning', 'Debugging'],
      },
    ],
  },
  {
    id: 'contact',
    eyebrow: '04',
    label: 'CONTACT',
    title: 'Contact.',
    image: dog,
    alt: 'Cloudy sky photo',
    body: [
      'I am open to backend work, practical products, QA automation, and systems that need careful API design.',
    ],
    actions: [
      { label: 'Email', href: 'mailto:minld.contact@gmail.com' },
      { label: 'GitHub', href: 'https://github.com/minld' },
    ],
  },
]
