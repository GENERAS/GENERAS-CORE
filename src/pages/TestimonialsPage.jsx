import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Star, Play, Pause, ExternalLink, Image as ImageIcon, Mic, 
  TrendingUp, Users, CheckCircle, Plus, X,
  MessageSquare, Building2, Briefcase, Globe,
  ChevronLeft, ChevronRight, Quote, Trophy, Target,
  Zap, Crown, ThumbsUp, Share2, Bell, Filter,
  Search, ChevronDown, Sparkles, Award, Rocket,
  Heart, ShoppingCart, Smartphone, CreditCard, Cpu, Wrench,
  BarChart3, Layers, ArrowRight, Images
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

export default function TestimonialsPage() {
  const [searchParams] = useSearchParams();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [source, setSource] = useState('all'); // 'all' | 'reviews' | 'projects'
  const [service, setService] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectImages, setProjectImages] = useState({});
  const [galleryProject, setGalleryProject] = useState(null);

  useEffect(() => {
    loadTestimonials();
    loadRecentActivity();
    loadClientProjects();
  }, []);

  // Auto-rotate featured testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      const featured = testimonials.filter(t => t.is_featured);
      if (featured.length > 1) {
        setFeaturedIndex(prev => (prev + 1) % featured.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  useEffect(() => {
    const action = searchParams.get('action');
    const open = searchParams.get('open');
    const submit = searchParams.get('submit');
    if (action === 'submit' || open === 'submit' || submit === 'true') {
      setShowSubmissionForm(true);
    }
  }, [searchParams]);

  const loadTestimonials = async () => {
    try {
      // Loaded unfiltered so the service filters below can match on
      // title/description text as well as project_type.
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real client work from the projects table doubles as visual proof.
  const loadClientProjects = async () => {
    try {
      const [{ data: projectRows }, { data: imageRows }] = await Promise.all([
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('project_images').select('project_id, image_url').order('sort_order'),
      ]);

      setProjects(projectRows || []);

      const grouped = {};
      (imageRows || []).forEach(img => {
        if (!grouped[img.project_id]) grouped[img.project_id] = [];
        grouped[img.project_id].push(img.image_url);
      });
      setProjectImages(grouped);
    } catch (error) {
      console.error('Error loading client projects:', error);
    }
  };

  const imagesForProject = (project) =>
    [...new Set([project.image_url, ...(projectImages[project.id] || [])].filter(Boolean))];

  const loadRecentActivity = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('client_name, submitted_at, project_type')
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false })
      .limit(5);
    setRecentSubmissions(data || []);
  };

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

  const sourceOptions = [
    { id: 'all', label: 'Everything', icon: Layers },
    { id: 'reviews', label: 'Client reviews', icon: MessageSquare },
    { id: 'projects', label: 'Client projects', icon: Briefcase },
  ];

  // Quick Actions
  const quickActions = [
    { icon: Plus, label: 'Add Review', color: 'blue', onClick: () => setShowSubmissionForm(true) },
    { icon: Share2, label: 'Share', color: 'purple', onClick: () => handleShare() },
    { icon: MessageSquare, label: 'WhatsApp', color: 'green', onClick: () => window.open('https://wa.me/0794144738?text=Hi! I saw your testimonials page.', '_blank') },
  ];

  // Stats calculation
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '0.0';
  const growthCount = testimonials.filter(t => t.clients_after > t.clients_before).length;
  const voiceCount = testimonials.filter(t => t.voice_message_en || t.voice_message_rw).length;
  const featuredCount = testimonials.filter(t => t.is_featured).length;

  // Service tags for a review: derived from its text plus its stored project_type.
  const reviewServices = (t) => [
    ...new Set([
      ...servicesFor(t.project_title, t.project_description, t.testimonial_text),
      ...(TYPE_TO_SERVICES[t.project_type] || []),
    ]),
  ];

  const projectServices = (p) => servicesFor(p.title, p.description, p.category, (p.tech_stack || []).join(' '));

  // Search across both sources
  const matchesSearch = (...parts) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return haystack(...parts).includes(q);
  };

  const allReviews = testimonials.filter(t =>
    serviceMatches(reviewServices(t), service) &&
    matchesSearch(t.client_name, t.client_company, t.project_title, t.testimonial_text, t.project_type)
  );

  const allProjects = projects.filter(p =>
    serviceMatches(projectServices(p), service) &&
    matchesSearch(p.title, p.description, p.category, p.client_name, (p.tech_stack || []).join(' '))
  );

  const filteredTestimonials = allReviews;
  const filteredProjects = allProjects;

  const showReviews = source === 'all' || source === 'reviews';
  const showProjects = source === 'all' || source === 'projects';

  const serviceCounts = SERVICE_FILTERS.reduce((acc, s) => {
    if (s.id === 'all') return acc;
    acc[s.id] =
      (showReviews ? allReviews.filter(t => reviewServices(t).includes(s.id)).length : 0) +
      (showProjects ? allProjects.filter(p => projectServices(p).includes(s.id)).length : 0);
    return acc;
  }, {});

  const totalResults = filteredTestimonials.length + filteredProjects.length;

  // Featured testimonials for carousel
  const featuredTestimonials = testimonials.filter(t => t.is_featured);
  const currentFeatured = featuredTestimonials[featuredIndex] || featuredTestimonials[0];

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
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-24 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[yellow-600] rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">
                  Success Stories
                </h1>
                <p className="text-xs text-gray-600">{testimonials.length} happy clients</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-600">Rating:</span>
                <span className="font-bold text-gray-800">{avgRating}/5</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Growth:</span>
                <span className="font-bold text-gray-800">{growthCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-600">Featured:</span>
                <span className="font-bold text-gray-800">{featuredCount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="px-4 py-2 bg-[yellow-600] hover:bg-[#8a5c7f] rounded-lg flex items-center gap-2 text-sm font-medium transition-colors duration-200 text-white"
            >
              <Plus className="w-4 h-4" />
              Share Your Story
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Sticky Navigation */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-28 space-y-4">
              {/* Show what you're looking at */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Show
                </h3>
                <div className="space-y-1">
                  {sourceOptions.map((option) => {
                    const Icon = option.icon;
                    const count = option.id === 'all'
                      ? testimonials.length + projects.length
                      : option.id === 'reviews'
                        ? testimonials.length
                        : projects.length;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSource(option.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          source === option.id
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Filters - same services as /business */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Services
                </h3>
                <div className="space-y-1">
                  {SERVICE_FILTERS.map((svc) => {
                    const Icon = svc.icon;
                    const count = svc.id === 'all' ? totalResults : (serviceCounts[svc.id] || 0);
                    return (
                      <button
                        key={svc.id}
                        onClick={() => setService(svc.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          service === svc.id
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{svc.label}</span>
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full shrink-0">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className={`p-3 rounded-xl border transition-colors duration-200 group ${
                        action.color === 'blue' ? 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200' :
                        action.color === 'purple' ? 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200' :
                        'bg-green-100 border-green-200 hover:bg-green-200'
                      }`}
                    >
                      <action.icon className={`mx-auto mb-1 ${
                        action.color === 'blue' ? 'text-yellow-600' :
                        action.color === 'purple' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <span className="text-xs text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Tags */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" /> Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Growth', 'Success', 'Trading', 'Website', 'App', 'Revenue'].map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors duration-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-7 space-y-6">

            {/* FEATURED TESTIMONIAL CAROUSEL */}
            {currentFeatured && (
              <div className="relative bg-white rounded-3xl p-6 border border-gray-300 overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured Story
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Screenshot */}
                  {currentFeatured.project_screenshot ? (
                    <div 
                      className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group"
                      onClick={() => setSelectedTestimonial(currentFeatured)}
                    >
                      <img 
                        src={currentFeatured.project_screenshot} 
                        alt={currentFeatured.project_title}
                        loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl aspect-video bg-gradient-to-br from-yellow-100 tyelrowle-100 flex items-center justify-center">
                      <Quote className="w-16 h-16 text-yellow-400" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[yellow-600] rounded-full flex items-center justify-center text-xl font-bold text-white">
                        {currentFeatured.client_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg break-words">{currentFeatured.client_name}</h3>
                        {currentFeatured.client_company && (
                          <p className="text-sm text-gray-600 break-words">{currentFeatured.client_company}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(currentFeatured.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold text-yellow-600 mb-2">{currentFeatured.project_title}</h4>
                      <p className="text-gray-700 line-clamp-4 break-words">"{currentFeatured.testimonial_text}"</p>
                    </div>
                    
                    {/* Impact Stats */}
                    {(currentFeatured.clients_before !== null || currentFeatured.revenue_before !== null) && (
                      <div className="flex gap-4">
                        {currentFeatured.clients_before !== null && (
                          <div className="bg-green-100 px-4 py-2 rounded-lg">
                            <span className="text-green-600 font-bold text-lg">+{calculateGrowth(currentFeatured.clients_before, currentFeatured.clients_after)}%</span>
                            <p className="text-xs text-green-700">Client Growth</p>
                          </div>
                        )}
                        {currentFeatured.revenue_before !== null && (
                          <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                            <span className="text-yellow-600 font-bold text-lg">+{calculateGrowth(currentFeatured.revenue_before, currentFeatured.revenue_after)}%</span>
                            <p className="text-xs text-yellow-700">Revenue Impact</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Carousel Navigation */}
                    {featuredTestimonials.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setFeaturedIndex(prev => prev === 0 ? featuredTestimonials.length - 1 : prev - 1)}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                          {featuredTestimonials.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setFeaturedIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                idx === featuredIndex ? 'bg-yellow-600' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <button 
                          onClick={() => setFeaturedIndex(prev => (prev + 1) % featuredTestimonials.length)}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="sticky top-24 z-40">
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reviews, clients, projects or keywords..."
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>

{/* Source toggle always visible - the two kinds of proof */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sourceOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSource(option.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                          source === option.id
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setShowSubmissionForm(true)}
                    className="ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-900 text-yellow-400 hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add review
                  </button>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Filter by service:</p>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_FILTERS.map((svc) => {
                        const Icon = svc.icon;
                        const count = svc.id === 'all' ? totalResults : (serviceCounts[svc.id] || 0);
                        return (
                          <button
                            key={svc.id}
                            onClick={() => setService(svc.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 ${
                              service === svc.id
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {svc.label}
                            <span className={`text-xs ${service === svc.id ? 'text-yellow-100' : 'text-gray-500'}`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="text-gray-900 font-semibold">{totalResults}</span> results
                {showReviews && <> Â· {filteredTestimonials.length} reviews</>}
                {showProjects && <> Â· {filteredProjects.length} client projects</>}
              </p>
              {(service !== 'all' || source !== 'all' || searchQuery) && (
                <button 
                  onClick={() => { setService('all'); setSource('all'); setSearchQuery(''); }}
                  className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* CLIENT PROJECTS - real work as visual proof */}
            {showProjects && filteredProjects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-800">Client projects</h2>
                    <span className="text-xs text-gray-500">real systems, real screenshots</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {filteredProjects.map((project) => {
                    const shots = imagesForProject(project);
                    const cover = shots[0];
                    const svc = SERVICE_FILTERS.find(s => s.id === service && s.id !== 'all') || SERVICE_FILTERS.find(s => projectServices(project).includes(s.id));
                    return (
                      <div
                        key={project.id}
                        className="group flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 hover:shadow-2xl shadow-xl transition-all duration-300"
                      >
                        <div className="relative h-44 bg-slate-900 overflow-hidden">
                          {cover ? (
                            <img src={cover} alt={project.title} loading="lazy" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <Images className="w-8 h-8 text-yellow-500" />
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
                          <h3 className="text-lg font-bold text-white">{project.title}</h3>
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
                                View screenshots <ArrowRight className="w-4 h-4" />
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
              </div>
            )}

            {/* REVIEWS */}
            {showReviews && filteredTestimonials.length > 0 && (
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-800">Client reviews</h2>
              </div>
            )}

            {/* Testimonials Feed */}
            <div className="space-y-4">
              {showReviews && filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  onMouseEnter={() => setHoveredCard(testimonial.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-white rounded-2xl p-5 border transition-colors duration-200 ${
                    hoveredCard === testimonial.id 
                      ? 'border-yellow-400' 
                      : 'border-gray-300'
                  } ${testimonial.is_featured ? 'ring-1 ring-yellow-400' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-[yellow-600] rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                        {testimonial.client_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg break-words">{testimonial.client_name}</h3>
                            {testimonial.is_featured && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1 whitespace-nowrap">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          {testimonial.client_company && (
                            <p className="text-sm text-gray-600 break-words">{testimonial.client_company}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      
                      {/* Project Info */}
                      <div className="mb-3">
                        <span className="text-yellow-600 font-medium break-words">{testimonial.project_title}</span>
                        <p className="text-sm text-gray-600 break-words">{testimonial.project_description}</p>
                      </div>
                      
                      {/* Testimonial Text */}
                      <p className="text-gray-700 mb-4 break-words whitespace-pre-wrap">"{testimonial.testimonial_text}"</p>
                      
                      {/* Screenshot & Actions Row */}
                      <div className="flex items-start gap-4">
                        {testimonial.project_screenshot && (
                          <div 
                            className="relative w-24 sm:w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                            onClick={() => setSelectedTestimonial(testimonial)}
                          >
                            <img
                              src={testimonial.project_screenshot}
                              alt={testimonial.project_title}
                              loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-wrap items-center gap-2">
                          {/* Voice Messages */}
                          {(testimonial.voice_message_en || testimonial.voice_message_rw) && (
                            <>
                              {testimonial.voice_message_en && (
                                <button
                                  onClick={() => toggleAudio(testimonial.voice_message_en, 'en')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors duration-200 ${
                                    playingAudio?.url === testimonial.voice_message_en
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  }`}
                                >
                                  {playingAudio?.url === testimonial.voice_message_en ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  <Mic className="w-3 h-3" /> EN
                                </button>
                              )}
                              {testimonial.voice_message_rw && (
                                <button
                                  onClick={() => toggleAudio(testimonial.voice_message_rw, 'rw')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors duration-200 ${
                                    playingAudio?.url === testimonial.voice_message_rw
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                                  }`}
                                >
                                  {playingAudio?.url === testimonial.voice_message_rw ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  <Mic className="w-3 h-3" /> RW
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* Impact Stats */}
                          {testimonial.clients_before !== null && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> +{calculateGrowth(testimonial.clients_before, testimonial.clients_after)}% Clients
                            </span>
                          )}
                          {testimonial.revenue_before !== null && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-lg text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> +{calculateGrowth(testimonial.revenue_before, testimonial.revenue_after)}% Revenue
                            </span>
                          )}
                          
                          {/* Links */}
                          {testimonial.project_link && (
                            <a
                              href={testimonial.project_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                            >
                              <Globe className="w-3 h-3" /> Live Site
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {totalResults === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Nothing matches yet</h3>
                <p className="text-gray-600">Try another service, or clear the filters to see everything</p>
                <button 
                  onClick={() => { setSearchQuery(''); setService('all'); setSource('all'); }}
                  className="mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Sticky */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              {/* Live Activity Feed */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Activity
                </h3>
                <div className="space-y-3">
                  {recentSubmissions.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                        {sub.client_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 truncate">{sub.client_name} shared a story</p>
                        <p className="text-xs text-gray-500">{sub.project_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Impact Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Rating</span>
                    <span className="font-bold text-yellow-600">{avgRating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth Stories</span>
                    <span className="font-bold text-green-600">{growthCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice Reviews</span>
                    <span className="font-bold text-yellow-600">{voiceCount}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-gray-800">
                  <Plus className="w-4 h-4 text-yellow-600" />
                  Share Your Story
                </h3>
                <p className="text-sm text-gray-600 mb-3">Have you worked with me? Share your experience!</p>
                <button
                  onClick={() => setShowSubmissionForm(true)}
                  className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Submit Testimonial
                </button>
              </div>

              {/* Top Industries */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Top Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Website', 'Trading', 'Mobile App', 'Web App'].map((industry) => (
                    <span key={industry} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors duration-200">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB for Submit */}
      <button
        onClick={() => setShowSubmissionForm(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-yellow-600 hover:bg-yellow-700 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Share Your Success Story</h2>
              <button
                onClick={() => setShowSubmissionForm(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TestimonialSubmissionForm 
                onSuccess={() => {
                  setShowSubmissionForm(false);
                  loadTestimonials();
                }}
                onCancel={() => setShowSubmissionForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedTestimonial && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
        >
          <div className="max-w-4xl max-h-[90vh]">
            <img
              src={selectedTestimonial.project_screenshot}
              alt={selectedTestimonial.project_title}
              loading="lazy" className="max-w-full max-h-[85vh] rounded-lg"
            />
            <p className="text-center mt-4 text-gray-300">
              {selectedTestimonial.project_title} - {selectedTestimonial.client_name}
            </p>
          </div>
        </div>
      )}
    {/* Client project screenshots - reuses the projects gallery viewer */}
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
