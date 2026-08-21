export const aboutSections = [
  {
    id: 'story',
    eyebrow: '01 / Story',
    title: 'I build useful software with a tester mindset.',
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
    alt: 'Abstract architectural lines in warm light',
    body: [
      'I am Luân Đỗ, a software engineer focused on backend systems, admin tools, and the details that make products feel reliable.',
      'My work sits between building features and proving they behave correctly. I like clean contracts, boring APIs, readable interfaces, and fast feedback loops.',
    ],
    stats: [
      { label: 'Focus', value: 'Backend / QA' },
      { label: 'Style', value: 'Practical systems' },
    ],
  },
  {
    id: 'experience',
    eyebrow: '02 / Experience',
    title: 'Learning through real projects, product constraints, and shipped work.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
    alt: 'Dark workspace with laptop and desk setup',
    body: [
      'I turn requirements into working flows: authentication, dashboards, content management, uploads, pagination, validation, and API documentation.',
      'The goal is always the same: make the product easier to maintain, easier to test, and easier for other developers to use.',
    ],
    timeline: [
      { period: 'Now', text: 'Portfolio, admin CMS, OpenAPI contracts, automation practice.' },
      { period: 'Before', text: 'Built school, personal, and lab projects across frontend and backend.' },
    ],
  },
  {
    id: 'skills',
    eyebrow: '03 / Skills',
    title: 'A compact stack for building, testing, and documenting web apps.',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Code editor on a laptop screen',
    groups: [
      { name: 'Backend', items: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL'] },
      { name: 'Frontend', items: ['Vue', 'Tailwind CSS', 'TanStack Query', 'Zod'] },
      { name: 'Quality', items: ['API tests', 'Swagger', 'Validation', 'Test data'] },
    ],
  },
  {
    id: 'contact',
    eyebrow: '04 / Contact',
    title: 'Open to practical products, backend work, and QA automation.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85',
    alt: 'Laptop showing a web application dashboard',
    body: [
      'If the work needs careful API design, clean admin flows, or testing discipline, it is the kind of problem I enjoy.',
    ],
    actions: [
      { label: 'Email', href: 'mailto:minld.contact@gmail.com' },
      { label: 'GitHub', href: 'https://github.com/minld' },
    ],
  },
]
