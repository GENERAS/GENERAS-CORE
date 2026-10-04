import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { sendCollaborationRequestConfirmation, sendAdminCollaborationNotification } from '../../utils/emailService';
import {
  Send, User, Mail, Phone, Building2, Lightbulb, Layers, Handshake,
  Wallet, CalendarClock, Link2, CheckCircle, Loader2, AlertCircle, Sparkles,
} from 'lucide-react';
import { COLLABORATION_TYPES, BUDGET_RANGES, TIMELINES } from './collaborationOptions';

const EMPTY = {
  full_name: '',
  email: '',
  phone: '',
  company: '',
  collaboration_type: '',
  project_title: '',
  project_summary: '',
  what_they_bring: '',
  tech_stack: '',
  budget_range: '',
  timeline: '',
  links: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const field =
  'w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-900';
const label = 'block text-sm font-semibold text-gray-700 mb-1.5';

function validate(values) {
  const errors = {};
  if (!values.full_name.trim()) errors.full_name = 'Tell me who you are.';
  if (!values.email.trim()) errors.email = 'An email is required so I can reply.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'That email address does not look right.';
  if (!values.collaboration_type) errors.collaboration_type = 'Pick the option that fits best.';
  if (!values.project_title.trim()) errors.project_title = 'Give your project or idea a name.';
  if (!values.project_summary.trim()) errors.project_summary = 'Describe what you want to build.';
  else if (values.project_summary.trim().length < 30) {
    errors.project_summary = 'A few more details, please - at least 30 characters.';
  }
  return errors;
}

export default function CollaborationForm({ onSubmitted, compact = false }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'done' | 'error'
  const [honeypot, setHoneypot] = useState('');

  const update = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`collab-${firstKey}`)?.focus();
      return;
    }

    // Bots fill every field they can see. This one is hidden and never filled
    // by a human, so a hit means we quietly drop the submission.
    if (honeypot) {
      setStatus('done');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: values.full_name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim() || null,
        company: values.company.trim() || null,
        collaboration_type: values.collaboration_type,
        project_title: values.project_title.trim(),
        project_summary: values.project_summary.trim(),
        what_they_bring: values.what_they_bring.trim() || null,
        tech_stack: values.tech_stack.trim() || null,
        budget_range: values.budget_range || null,
        timeline: values.timeline || null,
        links: values.links.trim() || null,
      };

      const { error: dbError } = await supabase.from('collaboration_requests').insert(payload);
      if (dbError) {
        console.error('Collaboration insert error:', dbError);
        throw dbError;
      }

      // Emails are a nice-to-have; never block the submission on them.
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;
      if (apiKey && apiKey !== 'your_resend_api_key') {
        await sendCollaborationRequestConfirmation(payload).catch(() => {});
        await sendAdminCollaborationNotification(payload).catch(() => {});
      }

      setValues(EMPTY);
      setStatus('done');
      onSubmitted?.();
    } catch (error) {
      console.error('Collaboration form error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'done') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Proposal received</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Thanks for reaching out. I read every proposal myself and reply to the promising ones with next steps,
          usually within 48 hours.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => setStatus(null)}
            className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition"
          >
            Send another proposal
          </button>
          <a
            href="/projects"
            className="px-5 py-2.5 border border-gray-300 hover:border-yellow-500 hover:text-yellow-700 rounded-lg font-semibold text-gray-700 transition"
          >
            See what I have built
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 bg-yellow-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <Handshake className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {compact ? 'Start a project' : 'Tell me what you want to build'}
          </h2>
          <p className="text-sm text-gray-600">
            No account needed. Everything here goes straight to my dashboard.
          </p>
        </div>
      </div>

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Something went wrong while saving your proposal. Please try again, or email me directly at{' '}
            <a href="mailto:generaskagiraneza@gmail.com" className="font-semibold underline">generaskagiraneza@gmail.com</a>.
          </span>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="collab-full_name" className={label}><User className="w-4 h-4 inline mr-1.5" />Full name *</label>
            <input
              id="collab-full_name"
              name="full_name"
              value={values.full_name}
              onChange={update}
              className={field}
              placeholder="Jane Mukamana"
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
          </div>

          <div>
            <label htmlFor="collab-email" className={label}><Mail className="w-4 h-4 inline mr-1.5" />Email *</label>
            <input
              id="collab-email"
              name="email"
              type="email"
              value={values.email}
              onChange={update}
              className={field}
              placeholder="you@company.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="collab-phone" className={label}><Phone className="w-4 h-4 inline mr-1.5" />Phone / WhatsApp</label>
            <input
              id="collab-phone"
              name="phone"
              value={values.phone}
              onChange={update}
              className={field}
              placeholder="+250 7XX XXX XXX"
            />
          </div>

          <div>
            <label htmlFor="collab-company" className={label}><Building2 className="w-4 h-4 inline mr-1.5" />Company or organisation</label>
            <input
              id="collab-company"
              name="company"
              value={values.company}
              onChange={update}
              className={field}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label htmlFor="collab-collaboration_type" className={label}>
            <Sparkles className="w-4 h-4 inline mr-1.5" />What kind of collaboration is this? *
          </label>
          <select
            id="collab-collaboration_type"
            name="collaboration_type"
            value={values.collaboration_type}
            onChange={update}
            className={field}
          >
            <option value="">Choose one...</option>
            {COLLABORATION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.collaboration_type && <p className="mt-1 text-xs text-red-600">{errors.collaboration_type}</p>}
        </div>

        <div>
          <label htmlFor="collab-project_title" className={label}>
            <Lightbulb className="w-4 h-4 inline mr-1.5" />Project or idea name *
          </label>
          <input
            id="collab-project_title"
            name="project_title"
            value={values.project_title}
            onChange={update}
            className={field}
            placeholder="e.g. Clinic booking system for 3 branches"
          />
          {errors.project_title && <p className="mt-1 text-xs text-red-600">{errors.project_title}</p>}
        </div>

        <div>
          <label htmlFor="collab-project_summary" className={label}>
            <Layers className="w-4 h-4 inline mr-1.5" />What do you want to build, and why? *
          </label>
          <textarea
            id="collab-project_summary"
            name="project_summary"
            rows={5}
            value={values.project_summary}
            onChange={update}
            className={`${field} resize-y`}
            placeholder="The problem, who it is for, and what a good outcome looks like."
          />
          {errors.project_summary && <p className="mt-1 text-xs text-red-600">{errors.project_summary}</p>}
        </div>

        <div>
          <label htmlFor="collab-what_they_bring" className={label}>
            <Handshake className="w-4 h-4 inline mr-1.5" />What would you bring to it?
          </label>
          <textarea
            id="collab-what_they_bring"
            name="what_they_bring"
            rows={3}
            value={values.what_they_bring}
            onChange={update}
            className={`${field} resize-y`}
            placeholder="Skills, capital, clients, data, connections, or simply your time - optional but it helps."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="collab-tech_stack" className={label}>
              <Layers className="w-4 h-4 inline mr-1.5" />Tech in mind
            </label>
            <input
              id="collab-tech_stack"
              name="tech_stack"
              value={values.tech_stack}
              onChange={update}
              className={field}
              placeholder="React, Supabase, Mobile Money..."
            />
          </div>

          <div>
            <label htmlFor="collab-budget_range" className={label}>
              <Wallet className="w-4 h-4 inline mr-1.5" />Budget range
            </label>
            <select
              id="collab-budget_range"
              name="budget_range"
              value={values.budget_range}
              onChange={update}
              className={field}
            >
              <option value="">Prefer not to say</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="collab-timeline" className={label}>
              <CalendarClock className="w-4 h-4 inline mr-1.5" />Timeline
            </label>
            <select
              id="collab-timeline"
              name="timeline"
              value={values.timeline}
              onChange={update}
              className={field}
            >
              <option value="">Flexible</option>
              {TIMELINES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="collab-links" className={label}>
              <Link2 className="w-4 h-4 inline mr-1.5" />Links
            </label>
            <input
              id="collab-links"
              name="links"
              value={values.links}
              onChange={update}
              className={field}
              placeholder="Portfolio, GitHub or LinkedIn URL"
            />
          </div>
        </div>

        {/* Honeypot: hidden from humans, irresistible to bots */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="collab-website">Website</label>
          <input
            id="collab-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send proposal
          </>
        )}
      </button>
      <p className="mt-3 text-xs text-gray-500">
        Your details are only used to reply to this proposal. No mailing list, no spam.
      </p>
    </form>
  );
}