import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { generateTrackingToken } from '../../utils/trackingToken';
import { usdToRwf } from '../../utils/currency';
import { sendServiceQuoteConfirmation, sendAdminServiceQuoteNotification } from '../../utils/emailService';
import { BUDGET_BANDS, DEADLINES } from './serviceNeeds';
import {
  X, Send, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  Sparkles, Clock, Wallet, MessageCircle,
} from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const input =
  'w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-900';
const label = 'block text-sm font-semibold text-gray-700 mb-1.5';

const EMPTY = {
  project_summary: '',
  current_problem: '',
  budget_band: '',
  deadline: '',
  full_name: '',
  email: '',
  phone: '',
  company: '',
};

const makeQuoteId = () => `QT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function ServiceQuoteForm({ open, onClose, service, need, services = [] }) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'done' | 'error'
  const [quoteId, setQuoteId] = useState('');

  // State is intentionally not reset here: the parent mounts this component
  // fresh for every quote request, so each one starts on a clean form.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const custom = Boolean(need?.custom) && !service;
  const heading = custom ? 'Tell me what to build' : service ? service.title : 'Get your quote';

  const update = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateStep1 = () => {
    const found = {};
    if (!values.project_summary.trim()) found.project_summary = 'A sentence or two is enough.';
    else if (values.project_summary.trim().length < 20) {
      found.project_summary = 'Add a little more detail - at least 20 characters.';
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const validateStep2 = () => {
    const found = {};
    if (!values.full_name.trim()) found.full_name = 'Required, so I know who to reply to.';
    if (!values.email.trim()) found.email = 'Required - your quote goes here.';
    else if (!EMAIL_RE.test(values.email.trim())) found.email = 'That email address does not look right.';
    if (!values.phone.trim()) found.phone = 'WhatsApp number, in case it is faster.';
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const id = makeQuoteId();
      const payload = {
        quote_id: id,
        tracking_token: generateTrackingToken(),
        service_id: service?.id ?? null,
        service_title: service?.title ?? null,
        service_slug: service?.slug ?? null,
        need_key: need?.key ?? null,
        custom_build: custom,
        project_summary: values.project_summary.trim(),
        current_problem: values.current_problem.trim() || null,
        budget_band: values.budget_band || null,
        deadline: values.deadline || null,
        full_name: values.full_name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim() || null,
        company: values.company.trim() || null,
      };

      // No .select() on purpose: the public role has no read policy.
      const { error: dbError } = await supabase.from('service_quotes').insert(payload);
      if (dbError) {
        console.error('Quote insert error:', dbError);
        throw dbError;
      }

      const apiKey = import.meta.env.VITE_RESEND_API_KEY;
      if (apiKey && apiKey !== 'your_resend_api_key') {
        await sendServiceQuoteConfirmation(payload).catch(() => {});
        await sendAdminServiceQuoteNotification(payload).catch(() => {});
      }

      setQuoteId(id);
      setStatus('done');
    } catch (err) {
      console.error('Quote form error:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-gray-900/70 backdrop-blur-sm p-4 sm:p-6">
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={() => onClose?.()} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8">
        <button
          type="button"
          onClick={() => onClose?.()}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {status === 'done' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quote request received</h2>
              <p className="text-gray-600 mt-2">
                Reference <span className="font-mono font-semibold text-gray-900">{quoteId}</span>
              </p>

              <div className="mt-6 text-left bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                <p className="font-semibold text-gray-900">What happens next</p>
                {[
                  'I read it myself, usually within a few hours.',
                  'You get a written quote by email, usually within 24-48 hours, with scope, price and timeline.',
                  'Nothing is charged now. You only pay if the quote makes sense to you.',
                ].map((line) => (
                  <p key={line} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    {line}
                  </p>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition"
                >
                  Done
                </button>
                <a
                  href={`https://wa.me/250794144738?text=${encodeURIComponent(`Hi, I just requested quote ${quoteId} about ${service?.title || 'a custom build'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 border border-gray-300 hover:border-yellow-500 rounded-lg font-semibold text-gray-700 transition inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Speed it up on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 pr-10">
                <div className="w-11 h-11 bg-yellow-600 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">Free, no obligation</p>
                  <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
                  <p className="text-sm text-gray-600">
                    {need?.headline ? `You said: "${need.headline}"` : 'Tell me what you need and I will send a written quote.'}
                  </p>
                </div>
              </div>

              {service && (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  {service.price_hourly && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-800 font-semibold">
                      <Wallet className="w-3.5 h-3.5" />
                      from ${service.price_hourly}/hr ({usdToRwf(service.price_hourly).toLocaleString()} RWF)
                    </span>
                  )}
                  {service.timeline && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      <Clock className="w-3.5 h-3.5" />
                      {service.timeline}
                    </span>
                  )}
                </div>
              )}

              {/* Step indicator */}
              <div className="mt-6 flex items-center gap-2">
                {[1, 2].map((n) => (
                  <div key={n} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-colors ${step >= n ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                    <p className={`mt-1.5 text-xs font-medium ${step >= n ? 'text-gray-900' : 'text-gray-400'}`}>
                      {n === 1 ? 'What you need' : 'Where to send it'}
                    </p>
                  </div>
                ))}
              </div>

              {status === 'error' && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Something went wrong sending that. Try again, or WhatsApp me on{' '}
                    <a href="https://wa.me/250794144738" target="_blank" rel="noopener noreferrer" className="font-semibold underline">0794 144 738</a>.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {step === 1 ? (
                  <>
                    <div>
                      <label htmlFor="quote-summary" className={label}>
                        {custom ? 'What should I build for you?' : 'What outcome do you want?'} *
                      </label>
                      <textarea
                        id="quote-summary"
                        name="project_summary"
                        rows={4}
                        value={values.project_summary}
                        onChange={update}
                        className={`${input} resize-y`}
                        placeholder={
                          custom
                            ? 'e.g. An app my 12 staff use to record deliveries and print invoices.'
                            : 'e.g. I want to stop guessing whether my ads are working and know exactly which enquiry came from where.'
                        }
                      />
                      {errors.project_summary && <p className="mt-1 text-xs text-red-600">{errors.project_summary}</p>}
                    </div>

                    <div>
                      <label htmlFor="quote-problem" className={label}>
                        What is failing today?
                      </label>
                      <textarea
                        id="quote-problem"
                        name="current_problem"
                        rows={3}
                        value={values.current_problem}
                        onChange={update}
                        className={`${input} resize-y`}
                        placeholder="What have you already tried? What does it cost you right now?"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="quote-budget" className={label}>Budget range</label>
                        <select id="quote-budget" name="budget_band" value={values.budget_band} onChange={update} className={input}>
                          <option value="">Prefer not to say</option>
                          {BUDGET_BANDS.map((band) => (
                            <option key={band} value={band}>{band}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="quote-deadline" className={label}>When do you need it?</label>
                        <select id="quote-deadline" name="deadline" value={values.deadline} onChange={update} className={input}>
                          <option value="">No deadline</option>
                          {DEADLINES.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { if (validateStep1()) setStep(2); }}
                      className="w-full sm:w-auto inline-flex items-center gap-2 px-7 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="quote-name" className={label}>Full name *</label>
                        <input id="quote-name" name="full_name" value={values.full_name} onChange={update} className={input} placeholder="Jane Mukamana" />
                        {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
                      </div>
                      <div>
                        <label htmlFor="quote-email" className={label}>Email *</label>
                        <input id="quote-email" name="email" type="email" value={values.email} onChange={update} className={input} placeholder="you@company.com" />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="quote-phone" className={label}>WhatsApp / phone *</label>
                        <input id="quote-phone" name="phone" value={values.phone} onChange={update} className={input} placeholder="+250 7XX XXX XXX" />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="quote-company" className={label}>Business</label>
                        <input id="quote-company" name="company" value={values.company} onChange={update} className={input} placeholder="Optional" />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Used only to send your quote. Nothing is charged on this form.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-gray-700 transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send me my quote
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>

              {!custom && services.length > 1 && step === 1 && (
                <p className="mt-5 text-xs text-gray-500">
                  Wrong service? Close this and pick another one - your answers are not lost while you decide.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}