// src/pages/BusinessPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import JobraPortfolioModal from '../components/common/JobraPortfolioModal'
import {
  Globe, ShoppingCart, BarChart3, CreditCard, Rocket,
  CheckCircle, ChevronRight, ArrowRight, Shield, Clock,
  Users, Star, MessageCircle, Zap, Code, Database,
  Smartphone, Monitor, Server, Brain, FileText, Layers,
  Settings, TrendingUp, Briefcase, Mail, ExternalLink,
  Wrench, Palette, Search as SearchIcon, Building2,
  Cpu, Phone, Package
} from 'lucide-react'

const serviceCategories = [
  {
    id: 'business-websites',
    icon: Globe,
    title: 'Business Websites',
    tagline: 'Professional sites that get customers and present your services',
    color: 'from-blue-600 to-indigo-600',
    lightColor: 'bg-blue-50',
    who: 'SMEs, restaurants, hotels, schools, NGOs, clinics, professionals, startups',
    subServices: [
      'Business websites',
      'Landing pages',
      'Company websites',
      'Personal portfolios',
      'Product/service websites',
      'Responsive mobile websites',
      'Multilingual websites',
    ],
    exampleOffer: 'I build fast, mobile-first websites that help businesses get customers and present their services professionally.',
    pricing: [
      { name: 'Starter', price: '150kâ€“250k RWF', features: ['1â€“3 pages', 'Mobile-first', 'WhatsApp/call buttons', 'Contact form', 'Basic SEO', 'Deployment'] },
      { name: 'Business', price: '300kâ€“500k RWF', features: ['5â€“8 pages', 'Custom design', 'Gallery & testimonials', 'Google Maps', 'Analytics'], popular: true },
      { name: 'Professional', price: '600kâ€“900k RWF', features: ['8â€“15 pages', 'CMS & blog', 'Advanced SEO', 'Multilingual', 'Custom UI'] },
      { name: 'Corporate', price: '1Mâ€“1.5M+ RWF', features: ['Custom architecture', 'Advanced CMS', 'Integrations', 'Dashboards'] },
    ],
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    title: 'E-commerce & Online Stores',
    tagline: 'Online stores that sell while you sleep',
    color: 'from-emerald-600 to-teal-600',
    lightColor: 'bg-emerald-50',
    who: 'Retailers, product businesses, wholesalers',
    subServices: [
      'Online stores',
      'Product catalogs',
      'Shopping carts & checkout',
      'Order management',
      'Customer accounts',
      'Product search/filtering',
      'WhatsApp ordering',
      'Mobile Money payment integration',
    ],
    exampleOffer: 'Everything you need to sell online â€” from product listings to Mobile Money checkout.',
    pricing: [
      { name: 'Starter Store', price: '700k RWF', features: ['Product catalog', 'Cart & checkout', 'WhatsApp ordering', 'Admin management', 'Mobile-first'] },
      { name: 'Business Store', price: '1.2M RWF', features: ['MoMo/Airtel integration', 'Customer accounts', 'Inventory', 'Discounts & coupons', 'Notifications'], popular: true },
      { name: 'Advanced Store', price: '2Mâ€“3.5M RWF', features: ['Multiple payments', 'Delivery management', 'Loyalty & segmentation', 'PWA', 'Advanced dashboard'] },
    ],
  },
  {
    id: 'business-systems',
    icon: BarChart3,
    title: 'Business Management Systems',
    tagline: 'A digital system that replaces your Excel books and manual processes',
    color: 'from-purple-600 to-pink-600',
    lightColor: 'bg-purple-50',
    who: 'Retail, schools, clinics, restaurants, NGOs',
    subServices: [
      'POS & inventory systems',
      'School management (fees, attendance, results)',
      'Clinic management (patients, appointments, billing)',
      'Restaurant systems (orders, tables, kitchen)',
      'NGO systems (beneficiaries, projects, donations)',
      'Sales tracking & reporting',
      'Supplier management',
    ],
    exampleOffer: 'A digital system that replaces your Excel books and manual processes.',
    pricing: [
      { name: 'Basic System', price: '800kâ€“1.2M RWF', features: ['Admin & staff login', 'Dashboard', 'Customers & products', 'Basic inventory', 'Sales & reports'] },
      { name: 'Business System', price: '1.5Mâ€“2.5M RWF', features: ['Inventory & suppliers', 'Roles & permissions', 'PDF invoices & receipts', 'Analytics', 'Notifications'], popular: true },
      { name: 'Advanced ERP', price: '3Mâ€“7M+ RWF', features: ['POS, accounting, HR, CRM', 'Multi-branch', 'Multi-user roles', 'APIs', 'PWA & payments'] },
    ],
  },
  {
    id: 'payment-integration',
    icon: CreditCard,
    title: 'Payment Integration',
    tagline: 'Get paid faster with automated payment systems',
    color: 'from-amber-500 to-orange-600',
    lightColor: 'bg-amber-50',
    who: 'E-commerce, schools, SaaS, events, NGOs, service businesses',
    subServices: [
      'MTN Mobile Money integration',
      'Airtel Money integration',
      'Payment gateways (Stripe, PayPal)',
      'Payment verification & callbacks',
      'Webhooks & transaction records',
      'Automated receipts',
      'Payment dashboards',
    ],
    exampleOffer: 'Automated payment systems â€” from Mobile Money to full payment dashboards.',
    pricing: [
      { name: 'Basic', price: '150kâ€“250k RWF', features: ['One payment provider', 'Payment initiation', 'Webhook/callback', 'Success/failure handling'] },
      { name: 'Multi-Payment', price: '300kâ€“500k RWF', features: ['MTN MoMo + Airtel', 'Transaction records', 'Payment dashboard', 'Receipts'], popular: true },
      { name: 'Advanced', price: '600kâ€“1.2M+ RWF', features: ['Multiple providers', 'Auto reconciliation', 'Refunds & ledger', 'Reporting', 'Admin controls'] },
    ],
  },
  {
    id: 'whatsapp-business',
    icon: MessageCircle,
    title: 'WhatsApp Business Systems',
    tagline: 'Automate customer interactions on the platform everyone uses',
    color: 'from-green-500 to-green-600',
    lightColor: 'bg-green-50',
    who: 'Any business communicating with customers via WhatsApp',
    subServices: [
      'WhatsApp ordering systems',
      'Customer support automation',
      'Automated replies',
      'Product catalogs on WhatsApp',
      'Order notifications',
      'Appointment booking',
      'Lead collection & follow-ups',
    ],
    exampleOffer: 'Customer sends "Hello" â†’ system asks what they need â†’ shows products â†’ collects order â†’ sends payment instructions.',
    pricing: [
      { name: 'Starter', price: '200kâ€“350k RWF', features: ['Click-to-chat', 'Product catalog', 'Predefined messages', 'Lead collection'] },
      { name: 'Automation', price: '500kâ€“900k RWF', features: ['Automated responses', 'Product discovery', 'Order collection', 'Customer database'], popular: true },
      { name: 'Sales System', price: '1Mâ€“2M+ RWF', features: ['AI assistant', 'Order processing', 'Payment links', 'Sales analytics', 'CRM integration'] },
    ],
  },
  {
    id: 'custom-saas',
    icon: Rocket,
    title: 'Custom SaaS Development',
    tagline: 'Software built specifically around your business operations',
    color: 'from-rose-600 to-red-600',
    lightColor: 'bg-rose-50',
    who: 'Startups, agencies, enterprises needing custom software',
    subServices: [
      'Multi-tenant SaaS platforms',
      'Admin & customer dashboards',
      'Subscription systems',
      'Role-based access control',
      'Analytics & notifications',
      'APIs & backend architecture',
      'Authentication & databases',
    ],
    exampleOffer: '"We manage 500 customers using Excel and WhatsApp." â€” I build you a proper system.',
    pricing: [
      { name: 'Small API', price: '250kâ€“500k RWF', features: ['Auth & CRUD', 'Database', 'REST API', 'Basic documentation'] },
      { name: 'Business API', price: '600kâ€“1.2M RWF', features: ['Roles & permissions', 'Integrations', 'Webhooks', 'Full documentation'], popular: true },
      { name: 'Advanced Backend', price: '1.5Mâ€“4M+ RWF', features: ['Complex business logic', 'Multiple integrations', 'Queues & analytics', 'Scalable architecture'] },
    ],
  },
  {
    id: 'automation-ai',
    icon: Cpu,
    title: 'Automation & AI Integration',
    tagline: 'Automate repetitive tasks â€” work less, scale smarter',
    color: 'from-violet-600 to-purple-600',
    lightColor: 'bg-violet-50',
    who: 'Any business with repetitive manual tasks',
    subServices: [
      'AI customer support chatbots',
      'AI product descriptions',
      'AI document processing',
      'Automated reports',
      'Lead qualification',
      'Email automation',
      'WhatsApp automation',
      'Business knowledge assistants',
    ],
    exampleOffer: 'Automatically answer common customer questions 24/7 without manually responding to every message.',
    pricing: [
      { name: 'AI Starter', price: '250kâ€“500k RWF', features: ['FAQ assistant', 'Document summarization', 'Content generation', 'Simple chatbot'] },
      { name: 'Business Automation', price: '600kâ€“1.2M RWF', features: ['AI assistant', 'Workflow automation', 'Database & notifications', 'Admin dashboard'], popular: true },
      { name: 'AI Platform', price: '1.5Mâ€“4M+ RWF', features: ['AI agent', 'Knowledge base', 'CRM & WhatsApp', 'Analytics', 'API integrations'] },
    ],
  },
  {
    id: 'website-maintenance',
    icon: Wrench,
    title: 'Website Maintenance & Support',
    tagline: 'Keep your website fast, secure, and up-to-date',
    color: 'from-slate-600 to-gray-700',
    lightColor: 'bg-slate-50',
    who: 'Any business with an existing website',
    subServices: [
      'Bug fixing',
      'Security updates',
      'Backups',
      'Content updates',
      'Performance optimization',
      'Database maintenance',
      'Hosting & domain management',
      'Monitoring',
    ],
    exampleOffer: 'Basic, Business, and Premium maintenance plans â€” from simple backups to priority support with dev hours.',
    pricing: [
      { name: 'Basic', price: '30k/month', features: ['Backups', 'Minor updates', 'Security checks', 'Basic support'] },
      { name: 'Business', price: '75k/month', features: ['Content updates', 'Performance monitoring', 'Bug fixes', 'Analytics reports'], popular: true },
      { name: 'Premium', price: '150kâ€“300k/month', features: ['Priority support', 'Security monitoring', 'Dev hours', 'Analytics & management'] },
    ],
  },
  {
    id: 'ui-ux-design',
    icon: Palette,
    title: 'UI/UX & Dashboard Design',
    tagline: 'Interfaces that look professional and actually work',
    color: 'from-pink-500 to-rose-500',
    lightColor: 'bg-pink-50',
    who: 'Businesses needing modern, user-friendly interfaces',
    subServices: [
      'Website UI design',
      'Admin dashboard design',
      'Mobile interfaces',
      'Figma prototypes',
      'Design systems',
      'UX improvements',
      'Responsive redesigns',
    ],
    exampleOffer: 'Clean, modern interfaces designed for how your users actually work.',
    pricing: [
      { name: 'UI Audit', price: '100kâ€“250k RWF', features: ['UX analysis', 'Improvement recommendations', 'Wireframe suggestions'] },
      { name: 'Landing Page', price: '100kâ€“250k RWF', features: ['Full landing page design', 'Mobile responsive', 'Figma file'] },
      { name: 'Full Website UI', price: '300kâ€“700k RWF', features: ['Complete UI design', 'Design system', 'Multiple pages'], popular: true },
      { name: 'SaaS Dashboard', price: '500kâ€“1.5M+ RWF', features: ['Dashboard design', 'Role-based views', 'Component library'] },
    ],
  },
  {
    id: 'website-improvement',
    icon: SearchIcon,
    title: 'Existing Website Improvement',
    tagline: "Fix what's broken â€” don't always rebuild from scratch",
    color: 'from-cyan-600 to-blue-600',
    lightColor: 'bg-cyan-50',
    who: 'Businesses with existing websites that underperform',
    subServices: [
      'Website audit (speed, mobile, SEO, UX)',
      'Conversion optimization',
      'Broken link fixes',
      'Accessibility improvements',
      'Full website redesign',
      'Performance improvements',
    ],
    exampleOffer: 'Many businesses already have websites that are terrible. I fix them â€” no need to rebuild from zero.',
    pricing: [
      { name: 'Quick Fix', price: '100kâ€“250k RWF', features: ['Bug fixes', 'Speed optimization', 'Broken links', 'Basic improvements'] },
      { name: 'Redesign', price: '300kâ€“700k RWF', features: ['Full redesign', 'Modern UI', 'Mobile-first', 'SEO optimization'], popular: true },
    ],
  },
  {
    id: 'seo-local',
    icon: SearchIcon,
    title: 'SEO & Local Business Visibility',
    tagline: 'Improve your technical and local search visibility',
    color: 'from-teal-600 to-cyan-600',
    lightColor: 'bg-teal-50',
    who: 'Local businesses wanting more online visibility',
    subServices: [
      'Google Business Profile setup',
      'Search-friendly pages',
      'Metadata & structured data',
      'Sitemap & indexing',
      'Page speed optimization',
      'Local landing pages',
    ],
    exampleOffer: 'Improve your technical and local search visibility â€” no empty promises.',
    pricing: [
      { name: 'Starter SEO', price: '100kâ€“200k RWF', features: ['Metadata', 'Sitemap', 'Indexing', 'Search Console setup'] },
      { name: 'Local Business', price: '250kâ€“500k RWF', features: ['Google Business Profile', 'Local SEO', 'Keyword research', 'Location pages'], popular: true },
      { name: 'Growth SEO', price: '500kâ€“1M+/month', features: ['Ongoing content', 'Keyword tracking', 'Backlinks', 'Monthly reporting'] },
    ],
  },
  {
    id: 'digitization-consulting',
    icon: Building2,
    title: 'Business Digitization Consulting',
    tagline: 'From notebooks + Excel + WhatsApp â†’ proper digital systems',
    color: 'from-indigo-600 to-blue-600',
    lightColor: 'bg-indigo-50',
    who: 'Businesses still using manual processes',
    subServices: [
      'Business process analysis',
      'Current workflow assessment',
      'Digital solution planning',
      'Software implementation',
      'Staff training',
      'Ongoing support',
    ],
    exampleOffer: 'You tell me your current process â†’ I identify problems â†’ propose digital solution â†’ implement â†’ train â†’ support.',
    pricing: [
      { name: 'Digital Assessment', price: '50kâ€“150k RWF', features: ['Workflow analysis', 'Problem identification', 'Recommendations report'] },
      { name: 'Process Digitization', price: '300kâ€“1M RWF', features: ['Process mapping', 'System design', 'Workflow automation', 'Staff training'], popular: true },
      { name: 'Full Transformation', price: '1.5Mâ€“5M+ RWF', features: ['Complete digitization', 'Custom systems', 'Integration', 'Ongoing support'] },
    ],
  },
  {
    id: 'api-backend',
    icon: Server,
    title: 'API & Backend Development',
    tagline: 'Robust backends for apps, platforms, and integrations',
    color: 'from-gray-700 to-gray-800',
    lightColor: 'bg-gray-50',
    who: 'Startups, companies with frontend developers needing backend',
    subServices: [
      'REST APIs',
      'Authentication systems',
      'Database design',
      'Payment API integration',
      'Third-party integrations',
      'Admin APIs',
      'Webhooks',
      'Backend architecture',
    ],
    exampleOffer: 'Solid backends â€” APIs, auth, databases, and integrations for your apps and platforms.',
    pricing: [
      { name: 'Small API', price: '250kâ€“500k RWF', features: ['Auth & CRUD', 'Database', 'REST API', 'Basic docs'] },
      { name: 'Business API', price: '600kâ€“1.2M RWF', features: ['Roles', 'Integrations', 'Webhooks', 'Full documentation'], popular: true },
      { name: 'Advanced Backend', price: '1.5Mâ€“4M+ RWF', features: ['Complex logic', 'Multiple integrations', 'Scalable architecture'] },
    ],
  },
  {
    id: 'database-services',
    icon: Database,
    title: 'Database Services',
    tagline: 'Design, optimize, and manage your data layer',
    color: 'from-amber-600 to-yellow-600',
    lightColor: 'bg-amber-50',
    who: 'Companies needing database design, migration, or optimization',
    subServices: [
      'MySQL / PostgreSQL / MongoDB',
      'Database design',
      'Data migration',
      'Backup systems',
      'Query optimization',
    ],
    exampleOffer: 'Clean database design, migration, and optimization for your applications.',
    pricing: [
      { name: 'Design & Setup', price: '150kâ€“300k RWF', features: ['Schema design', 'Tables & relations', 'Indexes', 'Initial setup'] },
      { name: 'Migration', price: '200kâ€“500k RWF', features: ['Data migration', 'Validation', 'Backup & rollback'], popular: true },
      { name: 'Optimization', price: '250kâ€“600k RWF', features: ['Query optimization', 'Performance tuning', 'Monitoring setup'] },
    ],
  },
  {
    id: 'hosting-deployment',
    icon: Layers,
    title: 'Hosting & Deployment',
    tagline: 'From development to production â€” fully deployed and live',
    color: 'from-orange-500 to-red-500',
    lightColor: 'bg-orange-50',
    who: 'Anyone needing help getting their app live',
    subServices: [
      'Website & API deployment',
      'Domain configuration',
      'SSL certificates',
      'Environment setup',
      'Production configuration',
      'Monitoring',
      'Cloud setup',
    ],
    exampleOffer: 'From development to production â€” fully deployed, secured, and monitored.',
    pricing: [
      { name: 'Deployment', price: '50kâ€“150k RWF', features: ['Domain & DNS', 'SSL', 'Deployment', 'Environment config'] },
      { name: 'Managed Hosting', price: '50kâ€“150k/month', features: ['Traffic management', 'Storage', 'Backups', 'Monitoring'], popular: true },
    ],
  },
]

const techStack = [
  { icon: Monitor, label: 'React / Next.js' },
  { icon: Server, label: 'Node.js / Express' },
  { icon: Database, label: 'Supabase / PostgreSQL' },
  { icon: Layers, label: 'Tailwind CSS' },
  { icon: Smartphone, label: 'Mobile-first PWA' },
  { icon: Brain, label: 'AI APIs' },
  { icon: CreditCard, label: 'Mobile Money' },
  { icon: MessageCircle, label: 'WhatsApp' },
  { icon: Settings, label: 'REST APIs' },
  { icon: Shield, label: 'Auth & RLS' },
]

const processSteps = [
  { step: '01', title: 'Discovery', desc: 'Tell me about your business, goals, and challenges. Free 15-minute call.' },
  { step: '02', title: 'Proposal', desc: 'I send a clear scope, timeline, and fixed price. No surprises.' },
  { step: '03', title: 'Build', desc: 'I build your system with regular updates. You see progress every step.' },
  { step: '04', title: 'Launch', desc: 'Testing, deployment, training. Your system goes live. Ongoing support available.' },
]

const caseStudies = [
  {
    title: 'DukaLinka',
    type: 'E-commerce Platform',
    desc: 'Multi-vendor marketplace with product catalogs, shopping cart, Mobile Money checkout, and vendor dashboards. Built for East African retailers.',
    tags: ['React', 'Supabase', 'Mobile Money', 'Real-time'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'ClinicOS',
    type: 'Clinic Management System',
    desc: 'Patient records, appointment scheduling, billing, and pharmacy inventory. Digitized a local clinic from paper to a fully digital workflow.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Dashboards'],
    color: 'from-purple-500 to-pink-600',
  },
]

const stats = [
  { value: '100+', label: 'Projects Delivered' },
  { value: '50+', label: 'Happy Clients' },
  { value: '24h', label: 'Response Time' },
  { value: '100%', label: 'Satisfaction Rate' },
]

const addOns = [
  { name: 'MoMo integration', price: '150k' },
  { name: 'Airtel Money integration', price: '150k' },
  { name: 'WhatsApp automation', price: '250k' },
  { name: 'AI assistant', price: '400k' },
  { name: 'Multilingual support', price: '100k' },
  { name: 'Advanced analytics', price: '150k' },
  { name: 'Customer portal', price: '250k' },
  { name: 'Staff/role system', price: '150k' },
  { name: 'Inventory module', price: '250k' },
  { name: 'POS module', price: '300k' },
  { name: 'Booking system', price: '250k' },
  { name: 'Delivery tracking', price: '300k' },
  { name: 'Custom API', price: '250k+' },
  { name: 'SEO setup', price: '100k' },
  { name: 'Google Business setup', price: '75k' },
  { name: 'UI/UX redesign', price: '200k+' },
  { name: 'Data migration', price: '100k+' },
  { name: 'Deployment', price: '50k+' },
]

export default function BusinessPage() {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showAddOns, setShowAddOns] = useState(false)
  const [portfolioOpen, setPortfolioOpen] = useState(false)

  return (
    <div className="min-h-screen -mx-6 -mt-28 -mb-8">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                Full-Stack Developer & Systems Architect
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              I build digital systems that help businesses{' '}
              <span className="text-yellow-400">sell</span>,{' '}
              <span className="text-yellow-400">operate</span>, and{' '}
              <span className="text-yellow-400">grow</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-2xl">
              From e-commerce stores to business management systems, I turn your ideas
              into production-ready software â€” with Mobile Money, real-time dashboards,
              and AI built in.
            </p>
            <p className="text-yellow-400 font-semibold mb-10 text-lg">
              Projects start from 250,000 RWF. Final price depends on features, integrations, and complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/hire-me"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
              >
                Start Your Project
              </Link>
              <a
                href="https://wa.me/250794144738"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 text-center"
              >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setPortfolioOpen(true)}
                className="border-2 border-yellow-400/50 text-yellow-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400/10 hover:border-yellow-400 transition-all duration-300 text-center inline-flex items-center justify-center"
              >
                <Briefcase className="w-5 h-5 inline mr-2" />
                View My Portfolio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15 Service Categories with Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What I Build & Pricing</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Transparent pricing for every service â€” see what you get before you commit
          </p>
        </div>

        <div className="space-y-8">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon
            const isExpanded = expandedCategory === cat.id
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {/* Header */}
                <div className={`${cat.lightColor} p-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{cat.title}</h3>
                        <p className="text-sm text-gray-600">{cat.tagline}</p>
                      </div>
                    </div>
                    <Link
                      to={`/hire-me?service=${encodeURIComponent(cat.id)}&service_name=${encodeURIComponent(cat.title)}`}
                      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow-md text-center text-sm whitespace-nowrap"
                    >
                      Get Quote
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {/* What's Included */}
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Includes</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.subServices.map((sub, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Pricing Tiers</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {cat.pricing.map((tier, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                            tier.popular
                              ? 'border-yellow-400 bg-yellow-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">{tier.name}</span>
                            {tier.popular && (
                              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-3">{tier.price}</div>
                          <div className="space-y-1.5">
                            {tier.features.map((f, j) => (
                              <div key={j} className="flex items-start gap-1.5">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-600">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For + Example */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Best for</p>
                      <p className="text-sm text-gray-700">{cat.who}</p>
                    </div>
                    <div className="flex-1 bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                      <p className="text-xs text-yellow-700 font-medium mb-1">Example</p>
                      <p className="text-sm text-yellow-800 italic">"{cat.exampleOffer}"</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Add-on Services</h2>
            <p className="text-gray-500">Enhance any package with these extras</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {addOns.map((addon, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all duration-300">
                <span className="text-sm font-medium text-gray-700 block mb-1">{addon.name}</span>
                <span className="text-yellow-600 font-bold text-sm">From {addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Technologies & Integrations</h2>
          <p className="text-gray-500">Modern tools powering every project</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {techStack.map((tech, idx) => {
            const Icon = tech.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all duration-300">
                <Icon className="w-7 h-7 text-gray-700 mx-auto mb-2" />
                <span className="text-xs font-medium text-gray-700">{tech.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Process */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-500">From first call to launch</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-5xl font-bold text-gray-100 mb-4">{step.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
                {idx < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 w-12 text-gray-300">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-lg text-gray-400">Real systems, built for real businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.map((cs, idx) => (
              <div key={idx} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                <div className={`bg-gradient-to-br ${cs.color} p-6`}>
                  <div className="text-sm font-medium opacity-80 mb-1">{cs.type}</div>
                  <h3 className="text-2xl font-bold">{cs.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-4">{cs.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cs.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Satisfaction Guaranteed</h3>
            <p className="text-sm text-gray-500">Not happy after the first milestone? Full refund. No risk.</p>
          </div>
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Most projects delivered in 2â€“4 weeks. Rush jobs available.</p>
          </div>
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ongoing Support</h3>
            <p className="text-sm text-gray-500">Launch is just the beginning. Maintenance & updates available.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to build something great?
          </h2>
          <p className="text-lg text-gray-800 mb-2 max-w-xl mx-auto">
            Tell me about your project. Free consultation â€” no commitment.
          </p>
          <p className="text-gray-800 mb-8 font-semibold">
            Projects start from 250,000 RWF
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hire-me"
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg text-center"
            >
              Get a Free Quote
            </Link>
            <a
              href="https://wa.me/250794144738"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg text-center"
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              WhatsApp Me
            </a>
          </div>
        </div>
      </section>

      <JobraPortfolioModal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} />
    </div>
  )
}
