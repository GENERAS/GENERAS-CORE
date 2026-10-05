import {
  Users, ClipboardList, TrendingDown, Code2, PenTool, Wrench,
} from 'lucide-react';

// Problem-first entry points for the Services page.
//
// Visitors do not arrive thinking "I need Development Mentorship". They arrive
// thinking "I keep losing money on trades" or "nobody is calling me back".
// Each need maps to the service categories that actually solve it, plus the one
// service we would recommend first.

export const SERVICE_NEEDS = [
  {
    key: 'more_customers',
    headline: "I'm not getting enough customers",
    detail: 'People visit, nobody buys, or the good leads go cold after the first message.',
    outcome: 'A positioning and follow-up system that turns the attention you already get into booked work.',
    categories: ['business', 'blog'],
    recommendedSlug: 'business-consulting',
    icon: Users,
    accent: 'from-yellow-500 to-amber-600',
  },
  {
    key: 'manual_mess',
    headline: 'My business runs on paper, WhatsApp and memory',
    detail: 'Orders, stock and follow-ups live in your head and in a dozen chats.',
    outcome: 'One simple operating system for your business, so nothing depends on you remembering it.',
    categories: ['business'],
    recommendedSlug: 'business-consulting',
    icon: ClipboardList,
    accent: 'from-gray-700 to-gray-900',
  },
  {
    key: 'trading_losses',
    headline: 'I lose money on trades I do not fully understand',
    detail: 'Entries look logical until the market moves against you, and then it is over.',
    outcome: 'A risk-first process: how much to risk, when to sit out, and how to review every trade honestly.',
    categories: ['trading'],
    recommendedSlug: 'trading-mentorship',
    icon: TrendingDown,
    accent: 'from-rose-600 to-red-700',
  },
  {
    key: 'cant_ship',
    headline: 'I can write code, but I never finish or ship',
    detail: 'The tutorial project is done. The real one is still an idea in a notes file.',
    outcome: 'A review loop and a shipping plan that turns your skill into work people pay for.',
    categories: ['development'],
    recommendedSlug: 'dev-mentorship',
    icon: Code2,
    accent: 'from-[#5C3B54] to-[#3B2436]',
  },
  {
    key: 'content_nothing',
    headline: 'I need content that actually brings leads',
    detail: 'You publish, nothing happens, and you start to dread writing.',
    outcome: 'Posts written around what buyers search, so each one has a job beyond existing.',
    categories: ['blog'],
    recommendedSlug: 'blog-writing',
    icon: PenTool,
    accent: 'from-sky-600 to-blue-700',
  },
  {
    key: 'build_a_system',
    headline: 'I need a system built for my business',
    detail: 'Not advice. You want the thing built, tested and handed over.',
    outcome: 'A written scope, a fixed quote, and a first version you can actually use.',
    categories: [],
    recommendedSlug: null,
    custom: true,
    icon: Wrench,
    accent: 'from-yellow-600 to-yellow-700',
  },
];

export const NEED_BY_KEY = Object.fromEntries(SERVICE_NEEDS.map((need) => [need.key, need]));

export const BUDGET_BANDS = [
  'Not sure yet',
  'Under $300',
  '$300 - $800',
  '$800 - $2,000',
  '$2,000 - $5,000',
  'Above $5,000',
  'I need a payment plan',
];

export const DEADLINES = [
  'Yesterday - it is urgent',
  'Within 2 weeks',
  'Within a month',
  'This quarter',
  'No deadline - planning ahead',
];
