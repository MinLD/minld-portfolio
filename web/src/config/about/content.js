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
      'I’m Luân Đỗ, a software engineering student with a self-taught mindset, driven by curiosity, ambition, and the desire to turn ideas into meaningful products. I enjoy exploring new technologies, building practical solutions, and continuously improving myself through every project I take on.',
      'This space is more than a showcase of finished work. It is also a record of the journey behind each project: the ideas that inspire me, the challenges that help me grow, and the lessons I learn throughout the process.',
      'I have always been curious about how things work and how simple ideas can grow into useful solutions. Most of my technical knowledge has come through self-directed learning. These skills were not developed overnight. They are the result of long nights, repeated practice, failed attempts, and the determination to keep moving forward even when progress felt slow.',
      'I consider myself ambitious, disciplined, and committed to long-term growth. I do not believe talent is simply something we are born with. To me, talent is developed over time through patience, consistency, and the willingness to change and become better. This belief shapes how I study, how I work, and how I pursue the goals that matter to me.',
      'Outside of technology, I enjoy playing badminton and listening to music. Badminton helps me stay active, focused, and energized, while music gives me time to relax, regain balance, and find inspiration after busy days of studying and coding.',
      'Life can sometimes become very busy, but I always try to maintain a healthy balance between work, learning, and the things I enjoy. Some days are spent exploring new technologies or working late on a project. Other days are for playing badminton, listening to my favorite songs, and allowing myself to slow down. To me, growth is not only about working harder. It is also about staying curious, maintaining balance, and learning to enjoy the journey.',
      'I believe the future belongs to those who are brave enough to believe in their dreams and disciplined enough to turn them into reality. This website is where I share pieces of that journey, including not only what I have achieved, but also the person I am becoming.',
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
        text: [
          '  GPA: 3.4 / 4.0. ',
          ' Top 3 University Software Engineering Competition, academic year 2024-2025.',
          'Top 3 University-Level Artificial Intelligence Competitions, 2025–2026 Academic Year.',
        ],
      },

      {
        period: '2026 - Present',
        title: 'Academic Project Lifecycle Management Platform',
        role: 'Full-stack Developer',
        text: [
          'Built an academic project lifecycle platform for thesis workflows, from topic registration to lecturer reviews and final evaluation.',
          'Developed the backend with Express.js, PostgreSQL, and Prisma, including multi-tenant data access and scoped RBAC permissions.',
          'Implemented document upload flows with MinIO, allowing students and lecturers to manage project files directly inside the system.',
          'Designed REST APIs and validation rules to keep project, review, and assignment data consistent across the workflow.',
        ],
      },
      {
        period: 'May 2026 - Present',
        title: 'Lutest - Automated Web UI Testing',
        role: 'Full-stack Developer',
        text: [
          'Built a local-first CLI and worker for automated web UI testing across modern single-page applications.',
          'Used Playwright to scan routes, capture screenshots, inspect DOM geometry, and detect visual or interaction issues.',
          'Implemented AABB-based overlap detection to identify layout collisions between UI elements across responsive viewports.',
          'Added WCAG-focused accessibility checks for readability, contrast, target size, and common UI quality issues.',
          'Generated Oklch-based color suggestions to help improve contrast while keeping colors visually consistent.',
          'Generated structured project information such as pages, routes, components, APIs, and UI states for easier debugging.',
        ],
      },
      {
        period: 'Dec 2025 - May 2026',
        title: 'CineFluent - AI-powered English Learning Through Movies',
        role: 'Full-stack Developer',
        text: [
          'Built an English learning platform that helps users study through movies, subtitles, and contextual vocabulary.',
          'Implemented bilingual subtitle workflows, flashcards, vocabulary exercises, listening dictation, and speaking shadowing.',
          'Integrated an XLM-RoBERTa grammar model to classify subtitle sentences into English tense categories for adaptive exercises.',
          'Built learner-tracking with DKT-LSTM to estimate user mastery from previous answers and select suitable practice content.',
          'Added Gemini Product-RAG for context-aware learning assistance grounded in CineFluent data.',
          'Stored and streamed movie content through Google Drive, Nginx, HLS, and X-Accel-Redirect, with real-time video calls using WebRTC and Socket.IO.',
        ],
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
