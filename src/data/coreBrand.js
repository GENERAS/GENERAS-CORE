// Parent-brand content for the GENERAS CORE portal (routes under /core).
// Everything here is descriptive brand information only — no invented
// employees, clients, revenue, statistics, offices or achievements.

export const BRAND = {
  name: 'GENERAS CORE',
  tagline: 'Building Beyond Digital.',
  description:
    'GENERAS CORE is a growing technology-focused brand centered on digital solutions, software systems, innovation, and future venture development.',
}

export const BRAND_TAGLINE = BRAND.tagline

// status: 'active' | 'developing' | 'planned'
// `icon` maps to a lucide-react component in the UI layer.
export const DIVISIONS = [
  {
    slug: 'generas-digital',
    name: 'GENERAS DIGITAL',
    short: 'Digital',
    icon: 'Globe',
    status: 'active',
    tagline: 'Websites, hosting and online business presence',
    description:
      'The commercial services division. It builds and manages the digital presence businesses need to be found, sell and operate online.',
    purpose:
      'Help businesses and individuals establish a reliable, professional and maintainable presence online.',
    activities: [
      'Website development',
      'Domain and hosting setup',
      'Deployment',
      'Website maintenance',
      'Online business solutions',
    ],
    audience:
      'Small businesses, startups, professionals and organisations that need a working website and a dependable online presence.',
    note: 'This is the first division with commercial services available now.',
    packages: [
      {
        name: 'Full Digital Package',
        price: 'From 500,000 RWF',
        featured: true,
        description:
          'Everything a business needs to get online and stay online — development, hosting, maintenance and support in one package.',
        includes: [
          'Professional website development',
          'Domain registration & setup',
          'Hosting setup',
          'Deployment & go-live',
          'SSL certificate',
          'Ongoing maintenance',
          'Technical support',
          'Mobile-responsive design',
          'Basic SEO setup',
          'Analytics setup',
          'Contact & WhatsApp integration',
          'Handover & basic training',
        ],
        note: '500,000 RWF is the starting price for the full package. Final price depends on pages, features and integrations.',
      },
    ],
    cta: { label: 'Start a digital project', to: '/core/contact?division=generas-digital' },
  },
  {
    slug: 'generas-systems',
    name: 'GENERAS SYSTEMS',
    short: 'Systems',
    icon: 'Workflow',
    status: 'developing',
    tagline: 'Business software, workflows, integrations and automation',
    description:
      'Focused on business software, the workflows behind it, integrations between tools, and automation that removes repetitive manual work.',
    purpose:
      'Replace manual and disconnected processes with software systems that fit how a business actually works.',
    activities: [
      'Business software',
      'Workflow design',
      'Integrations',
      'Automation',
    ],
    audience:
      'Organisations that manage operations through spreadsheets, paper or disconnected tools and want a single system.',
    note: 'In development — projects are taken case by case.',
  },
  {
    slug: 'generas-labs',
    name: 'GENERAS LABS',
    short: 'Labs',
    icon: 'FlaskConical',
    status: 'developing',
    tagline: 'Research, experiments and prototypes',
    description:
      'The research space for the brand — testing ideas, running experiments and building prototypes before anything is treated as a product.',
    purpose:
      'Explore new technologies and approaches safely, and learn by building small, focused prototypes.',
    activities: [
      'Research',
      'Experiments',
      'Prototypes',
    ],
    audience:
      'Internal exploration that later feeds the other divisions; occasional collaborations on research ideas.',
    note: 'In development — experimental by nature.',
  },
  {
    slug: 'generas-innovations',
    name: 'GENERAS INNOVATIONS',
    short: 'Innovations',
    icon: 'Lightbulb',
    status: 'developing',
    tagline: 'New products, AI applications and practical innovation',
    description:
      'Where validated ideas become new products, including applied AI, focused on practical outcomes rather than novelty.',
    purpose:
      'Turn promising prototypes into useful products and practical AI applications.',
    activities: [
      'New products',
      'AI applications',
      'Practical innovation',
    ],
    audience:
      'People and businesses that can benefit from focused, applied products and AI tooling.',
    note: 'In development — products are introduced as they mature.',
  },
  {
    slug: 'generas-technologies',
    name: 'GENERAS TECHNOLOGIES',
    short: 'Technologies',
    icon: 'Server',
    status: 'developing',
    tagline: 'Software engineering, platforms and technical infrastructure',
    description:
      'The engineering foundation — software engineering, platform work and the technical infrastructure the other divisions build on.',
    purpose:
      'Provide solid engineering and infrastructure so every division builds on reliable foundations.',
    activities: [
      'Software engineering',
      'Platforms',
      'Technical infrastructure',
    ],
    audience:
      'Internal engineering capability, available to partners who need platform and infrastructure expertise.',
    note: 'In development — foundational engineering work.',
  },
  {
    slug: 'generas-capital',
    name: 'GENERAS CAPITAL',
    short: 'Capital',
    icon: 'Landmark',
    status: 'planned',
    tagline: 'A future investment and venture-development initiative',
    description:
      'A future initiative aimed at investment and venture development within the GENERAS CORE ecosystem.',
    purpose:
      'Support the growth of ventures developed across the brand, once the operating divisions are established.',
    activities: [
      'Investment',
      'Venture development',
    ],
    audience:
      'Future stage — not currently operating an investment fund.',
    note: 'Planned — a future initiative, not an active investment fund.',
  },
]

export const DIVISION_BY_SLUG = DIVISIONS.reduce((acc, division) => {
  acc[division.slug] = division
  return acc
}, {})

export const MISSION =
  'To build practical digital systems, software and ventures that help people and businesses work smarter and grow — starting from real problems and delivering real outcomes.'

export const VISION =
  'To grow into a technology brand with a family of focused divisions that move from digital services, to systems and engineering, to products and long-term venture development.'

export const VALUES = [
  {
    title: 'Integrity',
    description: 'Honest scope, honest status, and no claims we cannot back up.',
  },
  {
    title: 'Craftsmanship',
    description: 'Well-built, maintainable work that lasts beyond the first release.',
  },
  {
    title: 'Practicality',
    description: 'Solutions shaped around real problems, not trends or buzzwords.',
  },
  {
    title: 'Clarity',
    description: 'Simple, understandable systems and straightforward communication.',
  },
  {
    title: 'Continuous learning',
    description: 'Research, experiment and improve through every project.',
  },
  {
    title: 'Long-term thinking',
    description: 'Build foundations that the next division and the next venture can rely on.',
  },
]

export const OPERATING_PHILOSOPHY = [
  {
    title: 'Understand before building',
    description: 'Every engagement starts with the problem and the people it affects, not the tooling.',
  },
  {
    title: 'Build in focused stages',
    description: 'Each division is developed deliberately, and labelled honestly as active, developing or planned.',
  },
  {
    title: 'Reuse and compound',
    description: 'Work from one division strengthens and feeds the next instead of starting from zero.',
  },
]

export const LONG_TERM_DIRECTION = [
  {
    phase: 'Now',
    title: 'Digital services',
    description: 'GENERAS DIGITAL provides websites, hosting, deployment and online business solutions.',
  },
  {
    phase: 'Next',
    title: 'Systems and engineering',
    description: 'GENERAS SYSTEMS, GENERAS TECHNOLOGIES, GENERAS LABS and GENERAS INNOVATIONS are developed in stages.',
  },
  {
    phase: 'Later',
    title: 'Venture development',
    description: 'GENERAS CAPITAL is a planned future initiative to support ventures built across the brand.',
  },
]

export const FOUNDER = {
  name: 'Kagiraneza Generas',
  role: 'Founder of GENERAS CORE',
  location: 'Kigali, Rwanda',
  photo: '/owner-photo.jpg',
  bio: [
    'Generas Kagiraneza is a Full-Stack Developer, Crypto and Forex trader, and entrepreneur based in Kigali, Rwanda, and the founder of GENERAS CORE.',
    'He works as a software developer, AI systems builder and digital innovator, designing and building software, AI tools and digital systems for individuals and businesses.',
    'GENERAS CORE grows out of that day-to-day work: a brand for the digital services he delivers today and the systems, products and ventures he is building toward.',
  ],
  links: [
    { label: 'View portfolio', to: '/projects' },
    { label: 'Work with the founder', to: '/contact' },
  ],
}

export const STATUS_META = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  developing: { label: 'Developing', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  planned: { label: 'Planned', className: 'bg-slate-200 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300' },
}

export const CORE_NAV = [
  { to: '/core', label: 'Home', end: true },
  { to: '/core/about', label: 'About' },
  { to: '/core/businesses', label: 'Our Businesses' },
  { to: '/core/projects', label: 'Projects' },
  { to: '/core/contact', label: 'Contact' },
]

export const CONTACT = {
  email: 'generaskagiraneza@gmail.com',
  phones: ['0794144738', '0781281207'],
  location: 'Kigali, Rwanda',
}
