import { useEffect, useState } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Star, Play, Pause, ExternalLink, Image as ImageIcon, Mic,
  TrendingUp, Plus, X, MessageSquare, Briefcase, Globe, Quote,
  ChevronLeft, ChevronRight, Sparkles, Trophy, Share2, Filter,
  Search, ArrowRight, Images, Building2, CheckCircle, Layers,
  ShoppingCart, Smartphone, CreditCard, Cpu, Wrench, BarChart3, Rocket
} from 'lucide-react';
import TestimonialSubmissionForm from '../components/testimonials/TestimonialSubmissionForm';
import ProjectLightbox from '../components/projects/ProjectLightbox';
import Loader from '../components/common/Loader';

// Service filters mirror the services offered on /business so visitors can
// check "have you done this for someone?" using the same language.
const SERVICE_FILTERS = [
  { id: 'all', label: 'All Services', icon: Layers },
  { id: 'websites', label: 'Websites', icon: Globe, gradient: 'from-blue-600 to-indigo-600', match: /website|web ?app|portfolio|landing page|blog|cms|seo/i },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, gradient: 'from-emerald-600 to-teal-600', match: /e-?commerce|shop|store|marketplace|multi-?vendor|vendor|cart|checkout|order management|catalog/i },
  { id: 'systems', label: 'Management Systems', icon: BarChart3, gradient: 'from-purple-600 to-pink-600', match: /management system|clinic|patient|appointment|pos\b|inventory|school|restaurant|ngo|erp|record|admin system/i },
  { id: 'mobile', label: 'Mobile Apps', icon: Smartphone, gradient: 'from-cyan-500 to-blue-600', match: /mobile|android|ios\b|react native|flutter|app\b/i },
  { id: 'payments', label: 'Payments', icon: CreditCard, gradient: 'from-amber-500 to-orange-600', match: /payment|momo|mobile money|airtel|stripe|paypal|billing|invoice/i },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, gradient: 'from-green-500 to-green-600', match: /whatsapp|wa\.me|whats app/i },
  { id: 'saas', label: 'SaaS & Dashboards', icon: Rocket, gradient: 'from-rose-600 to-red-600', match: /saas|dashboard|platform|multi-?tenant|\bapi\b|crm|subscription/i },
  { id: 'ai', label: 'AI & Automation', icon: Cpu, gradient: 'from-violet-600 to-purple-600', match: /\bai\b|automation|chatbot|assistant|machine learning|llm|automated/i },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, gradient: 'from-slate-600 to-gray-700', match: /maintenance|support|hosting|bug fix|security|backup|optimi[sz]ation/i },
];

// The submission form stores a coarse project_type; map it onto the services above.
const TYPE_TO_SERVICES = {
  website: ['websites'],
  web_app: ['websites', 'saas'],
  mobile_app: ['mobile'],
  trading_bot: ['systems', 'websites'],
  other: [],
};

const haystack = (...parts) => parts.filter(Boolean).join(' ').toLowerCase();

const servicesFor = (...parts) => {
  const text = haystack(...parts);
  return SERVICE_FILTERS.filter(s => s.match && s.match.test(text)).map(s => s.id);
};

const serviceMatches = (ids, service) => service === 'all' || ids.includes(service);

const fetchTestimonials = async () => {
  // Loaded unfiltered so the service filters below can match on
  // title/description text as well as project_type.
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Real client work from the projects table doubles as visual proof.
const fetchClientProjects = async () => {
  const [{ data: projectRows }, { data: imageRows }] = await Promise.all([
    supabase.from('projects').select('*').order('display_order'),
    supabase.from('project_images').select('project_id, image_url').order('sort_order'),
  ]);

  const grouped = {};
  (imageRows || []).forEach(img => {
    if (!grouped[img.project_id]) grouped[img.project_id] = [];
    grouped[img.project_id].push(img.image_url);
  });

  return { projects: projectRows || [], images: grouped };
};

const fetchRecentActivity = async () => {
  const { data } = await supabase
    .from('testimonials')
    .select('client_name, submitted_at, project_type')
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(5);
  return data || [];
};

const fetchEverything = () =>
  Promise.all([fetchTestimonials(), fetchRecentActivity(), fetchClientProjects()]);

// Always-visible in-page navigation. The global header only shows its links on
// large screens, so this rail keeps every key page one tap away on phones too,
// without hiding anything behind the menu icon.
const PAGE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/business', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/trading', label: 'Trading' },
  { to: '/community', label: 'Community' },
  { to: '/service', label: 'Mentorship' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
];

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export default function TestimonialsPage() {
  const [searchParams] = useSearchParams();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(() => {
    const action = searchParams.get('action');
    const open = searchParams.get('open');
    const submit = searchParams.get('submit');
    return action === 'submit' || open === 'submit' || submit === 'true';
  });
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [source, setSource] = useState('all'); // 'all' | 'projects' | 'reviews' | 'featured'
  const [service, setService] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectImages, setProjectImages] = useState({});
  const [galleryProject, setGalleryProject] = useState(null);

  const applyData = ([rows, recent, clientWork]) => {
    setTestimonials(rows);
    setRecentSubmissions(recent);
    setProjects(clientWork.projects);
    setProjectImages(clientWork.images);
  };

  const refreshData = () =>
    fetchEverything()
      .then(applyData)
      .catch(error => console.error('Error loading testimonials:', error));

  useEffect(() => {
    let active = true;
    fetchEverything()
      .then((payload) => {
        if (active) applyData(payload);
      })
      .catch(error => console.error('Error loading testimonials:', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const imagesForProject = (project) =>
    [...new Set([project.image_url, ...(projectImages[project.id] || [])].filter(Boolean))];

  const toggleAudio = (audioUrl, lang) => {
    if (playingAudio?.url === audioUrl) {
      playingAudio.audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        playingAudio.audio.pause();
      }
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudio({ url: audioUrl, audio, lang });
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const calculateGrowth = (before, after) => {
    if (!before || !after) return null;
    const growth = ((after - before) / before) * 100;
    return growth.toFixed(1);
  };

  const reviewServices = (t) => [
    ...new Set([
      ...servicesFor(t.project_title, t.project_description, t.testimonial_text),
      ...(TYPE_TO_SERVICES[t.project_type] || []),
    ]),
  ];

  const projectServices = (p) => servicesFor(p.title, p.description, p.category, (p.tech_stack || []).join(' '));

  const matchesSearch = (...parts) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return haystack(...parts).includes(q);
  };

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '0.0';
  const voiceCount = testimonials.filter(t => t.voice_message_en || t.voice_message_rw).length;
  const withScreenshots = projects.filter(p => imagesForProject(p).length > 0).length;

  const onlyFeatured = source === 'featured';

  const filteredTestimonials = testimonials.filter(t =>
    (!onlyFeatured || t.is_featured) &&
    serviceMatches(reviewServices(t), service) &&
    matchesSearch(t.client_name, t.client_company, t.project_title, t.testimonial_text, t.project_type)
  );

  const filteredProjects = projects.filter(p =>
    (!onlyFeatured || p.is_featured) &&
    serviceMatches(projectServices(p), service) &&
    matchesSearch(p.title, p.description, p.category, p.client_name, (p.tech_stack || []).join(' '))
  );

  const showProjects = source !== 'reviews';
  const showReviews = source !== 'projects';
  const totalResults = filteredTestimonials.length + filteredProjects.length;

  // The hero story comes from the filtered set, so it always matches whatever
  // the visitor is currently looking at.
  const featuredPool = filteredTestimonials.filter(t => t.is_featured);
  const currentFeatured = featuredPool.length
    ? featuredPool[featuredIndex % featuredPool.length]
    : null;

  // Auto-rotate the featured story in the hero
  useEffect(() => {
    if (featuredPool.length < 2) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredPool.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredPool.length]);

  const serviceCounts = SERVICE_FILTERS.reduce((acc, s) => {
    if (s.id === 'all') return acc;
    acc[s.id] =
      (showReviews ? filteredTestimonials.filter(t => reviewServices(t).includes(s.id)).length : 0) +
      (showProjects ? filteredProjects.filter(p => projectServices(p).includes(s.id)).length : 0);
    return acc;
  }, {});

  const sourceOptions = [
    { id: 'all', label: 'Everything', icon: Layers },
    { id: 'projects', label: 'Client projects', icon: Briefcase },
    { id: 'reviews', label: 'Client reviews', icon: MessageSquare },
    { id: 'featured', label: 'Featured', icon: Sparkles },
  ];

  const sourceCount = (id) => {
    if (id === 'projects') return projects.length;
    if (id === 'reviews') return testimonials.length;
    if (id === 'featured') return projects.filter(p => p.is_featured).length + testimonials.filter(t => t.is_featured).length;
    return projects.length + testimonials.length;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Client Success Stories',
        text: 'Check out these amazing client testimonials!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {/* ============ PAGE NAVIGATION RAIL ============ */}
      {/* Anchored below the 96px fixed header, so the logo and the header
          action icons stay clickable while this nav is pinned. */}
      <nav
        aria-label="Section navigation"
        className="sticky top-24 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <span className="hidden sm:flex items-center gap-2 shrink-0 pr-3 border-r border-gray-200 text-sm font-bold text-gray-900 whitespace-nowrap">
              <Trophy className="w-4 h-4 text-yellow-600" />
              Success Stories
            </span>

            <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
              {PAGE_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-[#714B67] bg-[#714B67]/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <button
              onClick={() => setShowSubmissionForm(true)}
              className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Share Your Story
            </button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">Client Success Stories</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl">
            Real projects, real screenshots, real client reviews.
          </h1>
          <p className="mt-3 text-gray-300 max-w-2xl leading-relaxed">
            Everything below is proof of work. Pick a service to see the systems I built for businesses like yours,
            then read what the clients themselves said about the work.
          </p>

          {/* At a glance */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            {[
              { value: projects.length, label: 'Client projects', icon: Briefcase },
              { value: withScreenshots, label: 'With screenshots', icon: Images },
              { value: testimonials.length, label: 'Written reviews', icon: MessageSquare },
              { value: `${avgRating}/5`, label: 'Average rating', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-3">
                <stat.icon className="w-4 h-4 text-yellow-400 mb-1.5" />
                <p className="text-2xl font-extrabold leading-none">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold transition-colors duration-200"
            >
              <Plus className="w-4 h-4" /> Add your review
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-700 hover:border-yellow-500 hover:text-yellow-400 text-gray-200 font-semibold transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" /> Share this page
            </button>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-700 hover:border-yellow-500 hover:text-yellow-400 text-gray-200 font-semibold transition-colors duration-200"
            >
              <Briefcase className="w-4 h-4" /> Full portfolio
            </a>
          </div>

          {/* Latest activity - one line, no sidebar needed */}
          {recentSubmissions.length > 0 && (
            <p className="mt-6 text-xs text-gray-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Latest review: {recentSubmissions[0].client_name} · {timeAgo(recentSubmissions[0].submitted_at)}
            </p>
          )}
        </div>
      </section>

      {/* ============ FILTERS ============ */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-40">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
          {/* 1. What am I looking at? */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Show me</p>
          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSource(option.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
                    source === option.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                  <span className={`text-xs ${source === option.id ? 'text-yellow-100' : 'text-gray-500'}`}>
                    {sourceCount(option.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, project or keyword…"
              className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500 text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* 3. Which service? */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3 h-3" /> Filter by service
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SERVICE_FILTERS.map((svc) => {
                const Icon = svc.icon;
                const count = svc.id === 'all' ? totalResults : (serviceCounts[svc.id] || 0);
                return (
                  <button
                    key={svc.id}
                    onClick={() => setService(svc.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                      service === svc.id
                        ? 'bg-gray-900 text-yellow-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {svc.label}
                    <span className={`text-xs ${service === svc.id ? 'text-gray-400' : 'text-gray-400'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result summary + reset */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{totalResults}</span> result{totalResults === 1 ? '' : 's'}
              {showProjects && <> · {filteredProjects.length} projects</>}
              {showReviews && <> · {filteredTestimonials.length} reviews</>}
            </p>
            {(service !== 'all' || source !== 'all' || searchQuery) && (
              <button
                onClick={() => { setService('all'); setSource('all'); setSearchQuery(''); }}
                className="text-sm font-medium text-yellow-700 hover:text-yellow-800 transition-colors duration-200"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============ FEATURED STORY ============ */}
      {currentFeatured && (
        <section className="max-w-6xl mx-auto px-4 pt-10">
          <div className="relative bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured story
            </span>
            <div className="grid md:grid-cols-2 gap-6 p-6 items-center">
              {currentFeatured.project_screenshot ? (
                <div
                  className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group bg-slate-900"
                  onClick={() => setSelectedTestimonial(currentFeatured)}
                >
                  <img
                    src={currentFeatured.project_screenshot}
                    alt={currentFeatured.project_title}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> View screenshot
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl aspect-video bg-gray-900 flex items-center justify-center">
                  <Quote className="w-14 h-14 text-yellow-400" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {currentFeatured.client_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg break-words">{currentFeatured.client_name}</h3>
                    {currentFeatured.client_company && (
                      <p className="text-sm text-gray-600 break-words">{currentFeatured.client_company}</p>
                    )}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(currentFeatured.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-yellow-700 mb-1.5 break-words">{currentFeatured.project_title}</h4>
                  <p className="text-gray-700 leading-relaxed break-words">"{currentFeatured.testimonial_text}"</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentFeatured.clients_before !== null && (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{calculateGrowth(currentFeatured.clients_before, currentFeatured.clients_after)}% clients
                    </span>
                  )}
                  {currentFeatured.revenue_before !== null && (
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{calculateGrowth(currentFeatured.revenue_before, currentFeatured.revenue_after)}% revenue
                    </span>
                  )}
                </div>

                {featuredPool.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFeaturedIndex(prev => (prev === 0 ? featuredPool.length - 1 : prev - 1))}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Previous story"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1">
                      {featuredPool.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFeaturedIndex(idx)}
                          aria-label={`Story ${idx + 1}`}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${idx === featuredIndex % featuredPool.length ? 'bg-yellow-600' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setFeaturedIndex(prev => (prev + 1) % featuredPool.length)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Next story"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ CLIENT PROJECTS ============ */}
      {showProjects && (
        <section className="max-w-6xl mx-auto px-4 pt-10">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-yellow-600" />
                Client projects
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Systems built for businesses. Open any card to see every screenshot.
              </p>
            </div>
            <span className="text-sm text-gray-500 shrink-0">{filteredProjects.length} shown</span>
          </div>

          {filteredProjects.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-200 p-6 text-center">
              No projects match this filter yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const shots = imagesForProject(project);
                const cover = shots[0];
                const svc = SERVICE_FILTERS.find(s => s.id === service && s.id !== 'all')
                  || SERVICE_FILTERS.find(s => projectServices(project).includes(s.id));
                return (
                  <div
                    key={project.id}
                    className="group flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 hover:shadow-2xl shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center gap-2 px-4 text-center">
                          <Images className="w-7 h-7 text-yellow-500" />
                          <span className="text-[11px] text-gray-400">Screenshots coming soon</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/70 text-yellow-300 text-[11px] font-semibold backdrop-blur-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Real client work
                      </span>
                      {shots.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                          {shots.length} screenshots
                        </span>
                      )}
                    </div>

                    <div className={`bg-gradient-to-br ${svc?.gradient || 'from-yellow-500 to-yellow-600'} px-5 py-3`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">{svc?.label || 'Client project'}</p>
                      <h3 className="text-lg font-bold text-white break-words">{project.title}</h3>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      {project.client_name && (
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-yellow-500" /> {project.client_name}
                        </p>
                      )}
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">{project.description}</p>

                      {project.tech_stack?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech_stack.slice(0, 3).map((tech, i) => (
                            <span key={i} className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">{tech}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex gap-2">
                        {shots.length > 0 ? (
                          <button
                            onClick={() => setGalleryProject(project)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200"
                          >
                            Screenshots <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <a
                            href="/contact"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200"
                          >
                            Request similar <ArrowRight className="w-4 h-4" />
                          </a>
                        )}
                        {project.live_demo_url && (
                          <a
                            href={project.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open live demo"
                            className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============ CLIENT REVIEWS ============ */}
      {showReviews && (
        <section className="max-w-6xl mx-auto px-4 pt-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                Client reviews
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Written and voice feedback left by clients{voiceCount > 0 ? ` · ${voiceCount} with voice messages` : ''}.
              </p>
            </div>
            <span className="text-sm text-gray-500 shrink-0">{filteredTestimonials.length} shown</span>
          </div>

          {filteredTestimonials.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-200 p-6 text-center">
              No reviews match this filter yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-yellow-600 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {testimonial.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold break-words">{testimonial.client_name}</h3>
                        {testimonial.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      {testimonial.client_company && (
                        <p className="text-sm text-gray-600 break-words">{testimonial.client_company}</p>
                      )}
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs mt-3">{timeAgo(testimonial.submitted_at)}</p>

                  <p className="text-gray-800 leading-relaxed mt-3 break-words">"{testimonial.testimonial_text}"</p>

                  {testimonial.project_title && (
                    <p className="text-sm text-gray-600 mt-3 break-words">
                      <span className="text-yellow-700 font-semibold">Project:</span> {testimonial.project_title}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 mt-auto">
                    {testimonial.project_screenshot && (
                      <button
                        onClick={() => setSelectedTestimonial(testimonial)}
                        className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 group"
                      >
                        <img
                          src={testimonial.project_screenshot}
                          alt={testimonial.project_title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </span>
                      </button>
                    )}

                    {testimonial.voice_message_en && (
                      <button
                        onClick={() => toggleAudio(testimonial.voice_message_en, 'en')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                          playingAudio?.url === testimonial.voice_message_en
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {playingAudio?.url === testimonial.voice_message_en ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <Mic className="w-3 h-3" /> Voice EN
                      </button>
                    )}

                    {testimonial.voice_message_rw && (
                      <button
                        onClick={() => toggleAudio(testimonial.voice_message_rw, 'rw')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                          playingAudio?.url === testimonial.voice_message_rw
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {playingAudio?.url === testimonial.voice_message_rw ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <Mic className="w-3 h-3" /> Voice RW
                      </button>
                    )}

                    {testimonial.clients_before !== null && (
                      <span className="px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +{calculateGrowth(testimonial.clients_before, testimonial.clients_after)}% clients
                      </span>
                    )}
                    {testimonial.revenue_before !== null && (
                      <span className="px-2.5 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +{calculateGrowth(testimonial.revenue_before, testimonial.revenue_after)}% revenue
                      </span>
                    )}

                    {testimonial.project_link && (
                      <a
                        href={testimonial.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Globe className="w-3 h-3" /> Live site
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============ NOTHING FOUND ============ */}
      {totalResults === 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-12">
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Nothing matches those filters</h3>
            <p className="text-gray-600 mb-5">Try another service, or reset to see everything.</p>
            <button
              onClick={() => { setSearchQuery(''); setService('all'); setSource('all'); }}
              className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Reset filters
            </button>
          </div>
        </section>
      )}

      {/* ============ BOTTOM CTA ============ */}
      <section className="max-w-6xl mx-auto px-4 pt-12">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Worked with me? Tell others how it went.</h2>
          <p className="text-gray-800 mb-6 max-w-xl mx-auto">
            Your review helps another business decide with confidence — screenshots, results and all.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-200"
            >
              <Plus className="w-4 h-4" /> Add your review
            </button>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-bold transition-colors duration-200"
            >
              Request a similar system <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============ SUBMISSION MODAL ============ */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Share Your Success Story</h2>
              <button
                onClick={() => setShowSubmissionForm(false)}
                aria-label="Close"
                className="p-2 hover:bg-slate-800 rounded-lg transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TestimonialSubmissionForm
                onSuccess={() => {
                  setShowSubmissionForm(false);
                  refreshData();
                }}
                onCancel={() => setShowSubmissionForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============ SCREENSHOT MODAL ============ */}
      {selectedTestimonial && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
        >
          <div className="max-w-4xl max-h-[90vh]">
            <img
              src={selectedTestimonial.project_screenshot}
              alt={selectedTestimonial.project_title}
              loading="lazy"
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            <p className="text-center mt-4 text-gray-300">
              {selectedTestimonial.project_title} - {selectedTestimonial.client_name}
            </p>
          </div>
        </div>
      )}

      {/* ============ PROJECT GALLERY ============ */}
      {galleryProject && (
        <ProjectLightbox
          key={galleryProject.id}
          project={galleryProject}
          images={imagesForProject(galleryProject)}
          onClose={() => setGalleryProject(null)}
        />
      )}
    </div>
  );
}