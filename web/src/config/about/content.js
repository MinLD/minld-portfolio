import avtImage from '@/assets/images/avt.jpeg'
import cloudImage from '@/assets/images/cloud.jpg'
import flowerImage from '@/assets/images/hoacuc.jpg'
import dog from '@/assets/images/dog.jpg'

const sharedSkills = [
  {
    key: 'programming',
    items: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL'],
  },
  { key: 'frontend', items: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'HTML5', 'CSS3'] },
  {
    key: 'backend',
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
    key: 'database',
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
    key: 'devops',
    items: ['Docker', 'Nginx', 'Git', 'GitHub', 'GitHub Actions', 'CI/CD'],
  },
  {
    key: 'testing',
    items: ['Playwright', 'API Testing', 'UI Automation', 'Test Planning', 'Debugging'],
  },
]

const skillNames = {
  en: {
    programming: 'Programming Languages',
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Database',
    devops: 'DevOps & Tools',
    testing: 'Testing & Quality',
  },
  vi: {
    programming: 'Ngôn ngữ lập trình',
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Cơ sở dữ liệu',
    devops: 'DevOps & Công cụ',
    testing: 'Kiểm thử & Chất lượng',
  },
}

function localizedSkills(locale) {
  return sharedSkills.map((group) => ({
    name: skillNames[locale][group.key],
    items: group.items,
  }))
}

export const aboutContent = {
  en: [
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
        'Life can sometimes become very busy, but I always try to maintain a healthy balance between work, learning, and the things I enjoy. Some days are spent exploring new technologies or working late on a project. Other days are for playing badminton, listening to my favorite songs, and allowing myself to slow down.',
        'I believe the future belongs to those who are brave enough to believe in their dreams and disciplined enough to turn them into reality. This website is where I share pieces of that journey, including not only what I have achieved, but also the person I am becoming.',
      ],
      quote: 'Reliable software is built from small decisions repeated well.',
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
            'GPA: 3.4 / 4.0.',
            'Top 3 University Software Engineering Competition, academic year 2024-2025.',
            'Top 3 University-Level Artificial Intelligence Competitions, 2025-2026 academic year.',
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
      groups: localizedSkills('en'),
    },
    {
      id: 'contact',
      eyebrow: '04',
      label: 'CONTACT',
      title: 'Contact.',
      image: dog,
      alt: 'Dog photo',
      body: [
        'I am open to backend work, practical products, QA automation, and systems that need careful API design.',
      ],
      actions: [
        { label: 'Email', href: 'mailto:minld.contact@gmail.com' },
        { label: 'GitHub', href: 'https://github.com/minld' },
      ],
    },
  ],
  vi: [
    {
      id: 'story',
      eyebrow: '01',
      label: 'CÂU CHUYỆN',
      title: 'Câu chuyện của tôi',
      image: avtImage,
      alt: 'Ảnh chân dung Luân Đỗ',
      body: [
        'Tôi là Luân Đỗ, sinh viên ngành công nghệ kỹ thuật phần mềm với tinh thần tự học, tò mò và mong muốn biến ý tưởng thành sản phẩm có giá trị. Tôi thích khám phá công nghệ mới, xây dựng giải pháp thực tế và cải thiện bản thân qua từng dự án.',
        'Không gian này không chỉ là nơi trưng bày những sản phẩm đã hoàn thành. Nó còn là bản ghi lại hành trình phía sau mỗi dự án: ý tưởng khởi đầu, thử thách giúp tôi trưởng thành và những bài học tôi tích lũy trong quá trình làm việc.',
        'Tôi luôn tò mò về cách mọi thứ vận hành và cách một ý tưởng đơn giản có thể phát triển thành một giải pháp hữu ích. Phần lớn kiến thức kỹ thuật của tôi đến từ quá trình tự học, luyện tập liên tục và thử sai qua nhiều dự án thực tế.',
        'Tôi xem mình là người tham vọng, kỷ luật và hướng đến sự phát triển dài hạn. Với tôi, năng lực không chỉ là thứ có sẵn, mà được xây dựng qua thời gian, sự kiên trì và khả năng thay đổi để tốt hơn.',
        'Ngoài công nghệ, tôi thích chơi cầu lông và nghe nhạc. Cầu lông giúp tôi giữ năng lượng và sự tập trung, còn âm nhạc giúp tôi cân bằng lại sau những ngày học tập và làm việc với code.',
        'Có những ngày tôi dành nhiều thời gian để học công nghệ mới hoặc hoàn thiện một dự án. Cũng có những ngày tôi cho phép bản thân chậm lại, chơi thể thao, nghe vài bài nhạc yêu thích và lấy lại nhịp sống cân bằng.',
        'Tôi tin tương lai thuộc về những người đủ can đảm để tin vào ước mơ của mình và đủ kỷ luật để biến nó thành hiện thực. Website này là nơi tôi chia sẻ một phần hành trình đó.',
      ],
      quote: 'Phần mềm đáng tin cậy được tạo nên từ những quyết định nhỏ được lặp lại đúng cách.',
    },
    {
      id: 'experience',
      eyebrow: '02',
      label: 'HỌC VẤN & KINH NGHIỆM',
      title: 'Học vấn & Kinh nghiệm.',
      image: cloudImage,
      alt: 'Ảnh bầu trời nhiều mây',
      timeline: [
        {
          period: '2023 - Hiện tại',
          title: 'Đại học Nguyễn Tất Thành',
          role: 'Công nghệ kỹ thuật phần mềm',
          text: [
            'GPA: 3.4 / 4.0.',
            'Top 3 cuộc thi Công nghệ phần mềm cấp trường, năm học 2024-2025.',
            'Top 3 cuộc thi Trí tuệ nhân tạo cấp trường, năm học 2025-2026.',
          ],
        },
        {
          period: '2026 - Hiện tại',
          title: 'Nền tảng quản lý vòng đời đề tài học thuật',
          role: 'Full-stack Developer',
          text: [
            'Xây dựng nền tảng quản lý quy trình đề tài học thuật, từ đăng ký đề tài đến giảng viên phản biện và đánh giá cuối kỳ.',
            'Phát triển backend với Express.js, PostgreSQL và Prisma, bao gồm phân quyền RBAC và giới hạn truy cập dữ liệu theo phạm vi.',
            'Triển khai luồng upload tài liệu với MinIO để sinh viên và giảng viên quản lý file trực tiếp trong hệ thống.',
            'Thiết kế REST API và validation nhằm giữ dữ liệu đề tài, đánh giá và phân công nhất quán trong toàn bộ quy trình.',
          ],
        },
        {
          period: '05/2026 - Hiện tại',
          title: 'Lutest - Tự động kiểm thử giao diện web',
          role: 'Full-stack Developer',
          text: [
            'Xây dựng CLI và worker local-first để tự động kiểm thử giao diện web cho các ứng dụng single-page hiện đại.',
            'Dùng Playwright để quét route, chụp màn hình, phân tích DOM geometry và phát hiện lỗi giao diện hoặc tương tác.',
            'Triển khai thuật toán AABB để phát hiện các phần tử UI bị chồng lấn ở nhiều viewport responsive.',
            'Bổ sung kiểm tra theo hướng WCAG cho khả năng đọc, độ tương phản, kích thước target và các vấn đề chất lượng UI thường gặp.',
            'Sinh gợi ý màu bằng Oklch nhằm cải thiện contrast nhưng vẫn giữ màu sắc nhất quán về mặt thị giác.',
          ],
        },
        {
          period: '12/2025 - 05/2026',
          title: 'CineFluent - Học tiếng Anh bằng phim với AI',
          role: 'Full-stack Developer',
          text: [
            'Xây dựng nền tảng học tiếng Anh qua phim, phụ đề và ngữ cảnh từ vựng.',
            'Triển khai phụ đề song ngữ, flashcard, bài tập từ vựng, nghe chép chính tả và speaking shadowing.',
            'Tích hợp mô hình XLM-RoBERTa để phân loại câu phụ đề theo thì tiếng Anh và tạo bài tập thích ứng.',
            'Xây dựng cơ chế theo dõi người học bằng DKT-LSTM để ước lượng mức độ thành thạo từ lịch sử trả lời.',
            'Tích hợp Gemini Product-RAG để hỗ trợ học tập dựa trên dữ liệu của CineFluent.',
          ],
        },
      ],
    },
    {
      id: 'skills',
      eyebrow: '03',
      label: 'KỸ NĂNG',
      title: 'Kỹ năng.',
      image: flowerImage,
      alt: 'Ảnh hoa cúc trắng',
      groups: localizedSkills('vi'),
    },
    {
      id: 'contact',
      eyebrow: '04',
      label: 'LIÊN HỆ',
      title: 'Liên hệ.',
      image: dog,
      alt: 'Ảnh chú chó',
      body: [
        'Tôi luôn sẵn sàng trao đổi về backend, sản phẩm thực tế, QA automation và các hệ thống cần thiết kế API cẩn thận.',
      ],
      actions: [
        { label: 'Email', href: 'mailto:minld.contact@gmail.com' },
        { label: 'GitHub', href: 'https://github.com/minld' },
      ],
    },
  ],
}

export const aboutSections = aboutContent.en
