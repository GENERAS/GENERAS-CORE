import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import CollaborationForm from '../components/collaboration/CollaborationForm';
import {
  Handshake, Rocket, Users, Code2, Lightbulb, GraduationCap, GitBranch,
  ArrowRight, CheckCircle, Sparkles,
} from 'lucide-react';

const WAYS_IN = [
  {
    icon: Rocket,
    title: 'You have a project',
    body: 'A system, website or app that needs scoping, building and shipping.',
  },
  {
    icon: Lightbulb,
    title: 'You have an idea',
    body: 'A half-formed concept that needs validation, architecture and a first version.',
  },
  {
    icon: Users,
    title: 'You have clients or capital',
    body: 'You bring the market or the funding, I bring the technical execution.',
  },
  {
    icon: Code2,
    title: 'You can build',
    body: 'Developer, designer or QA looking for real client work and a reference build.',
  },
  {
    icon: GraduationCap,
    title: 'You want to learn by building',
    body: 'Junior developer or intern who wants mentorship on a live project.',
  },
  {
    icon: GitBranch,
    title: 'You want to contribute',
    body: 'Open source, tooling or a community project that fits what I already run.',
  },
];

const STEPS = [
  {
    title: 'You send the proposal',
    body: 'What you want to build, what you bring, budget and timeline. It lands in my dashboard, not a generic inbox.',
  },
  {
    title: 'I review it personally',
    body: 'I read every one. If there is a fit and a realistic path to v1, you get a reply with questions or a call.',
  },
  {
    title: 'We scope and start',
    body: 'A short written scope: what v1 includes, who owns what, how we split the work and how we get paid.',
  },
];

function WayCard({ icon, title, body }) {
  const Icon = icon;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-yellow-400 hover:shadow-md transition">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-600 mb-3">
        <Icon className="w-5 h-5" />
      </span>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
    </div>
  );
}

export default function CollaboratePage() {
  usePageTitle('/collaborate');

  return (
    <div className="space-y-14 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#3B2436] to-[#5C3B54] text-white px-6 py-12 md:px-12 md:py-16">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500/15 ring-1 ring-yellow-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-300">
            <Handshake className="w-4 h-4" />
            Open to collaboration
          </span>

          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            Have a project, an idea, or something to trade? Let's build it together.
          </h1>

          <p className="mt-4 text-gray-300 text-base md:text-lg leading-relaxed">
            This form is not for quick questions. It is for people who want to ship something real: an idea that
            needs an architect, a business that needs a system, a developer who wants client work, or a partner with
            capital, clients or connections. Tell me what you have and what you want, and I will reply personally.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#proposal"
              className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl font-bold transition"
            >
              Start your proposal
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-3 border border-white/25 hover:border-yellow-400 hover:text-yellow-300 rounded-xl font-semibold transition"
            >
              See what I have built
            </Link>
          </div>

          <ul className="mt-8 grid sm:grid-cols-3 gap-3 text-sm text-gray-300">
            {['Reply within 48 hours', 'No account needed', 'NDA friendly'].map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ways to work together */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ways we could work together</h2>
        <p className="text-gray-600 mb-6">Pick whichever fits. Most collaborations start from one of these six.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WAYS_IN.map((way) => (
            <WayCard key={way.title} {...way} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          What happens after you hit send
        </h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-yellow-400 font-bold text-sm mb-3">
                {index + 1}
              </span>
              <h3 className="font-bold text-gray-900">{step.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Form */}
      <section id="proposal" className="scroll-mt-28">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <CollaborationForm />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="bg-gray-900 text-white rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-2">Prefer email or WhatsApp?</h3>
              <p className="text-sm text-gray-300 mb-4">
                Same thing, just slower. If your idea is still fuzzy, talk it through instead of writing it up.
              </p>
              <a
                href="mailto:generaskagiraneza@gmail.com"
                className="block text-sm font-semibold text-yellow-400 hover:text-yellow-300 break-all"
              >
                generaskagiraneza@gmail.com
              </a>
              <div className="mt-3 flex flex-col gap-1 text-sm">
                <a href="tel:0794144738" className="text-gray-300 hover:text-white">0794144738</a>
                <a href="tel:0781281207" className="text-gray-300 hover:text-white">0781281207</a>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">Not a collaboration?</h3>
              <p className="text-sm text-gray-600">
                Quick questions, support or business enquiries have their own faster route.
              </p>
              <Link
                to="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-700 hover:text-yellow-800"
              >
                Go to the contact page
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}