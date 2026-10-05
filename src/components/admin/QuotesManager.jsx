import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import {
  FileText, Mail, Phone, Building2, Search, RefreshCw, Trash2, Save,
  ExternalLink, Wallet, CalendarClock, Send, CheckCircle,
} from 'lucide-react';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'quoted', label: 'Quote sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'deposit_paid', label: 'Deposit paid' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'declined', label: 'Declined' },
];

const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));

const STATUS_STYLES = {
  new: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 ring-yellow-500/30',
  reviewing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 ring-blue-500/30',
  quoted: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 ring-indigo-500/30',
  accepted: 'bg-green-500/15 text-green-700 dark:text-green-400 ring-green-500/30',
  deposit_paid: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-emerald-500/30',
  in_progress: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 ring-purple-500/30',
  delivered: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 ring-teal-500/30',
  declined: 'bg-red-500/15 text-red-700 dark:text-red-400 ring-red-500/30',
};

const WON = ['accepted', 'deposit_paid', 'in_progress', 'delivered'];

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const money = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : null;
};

const QuotesManager = () => {
  const { isDark } = useTheme();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [quoteDraft, setQuoteDraft] = useState({ quoted_amount: '', quoted_currency: 'USD', quote_notes: '' });
  const [depositDraft, setDepositDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const bg = isDark ? 'bg-gray-800' : 'bg-white';
  const bgSub = isDark ? 'bg-gray-700/50' : 'bg-gray-50';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDark
    ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const pageBg = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const btnGhost = isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  const linkAccent = isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700';
  const dangerLink = isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700';

  // No setState before the first await: this is called straight from an effect.
  const fetchQuotes = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('service_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setQuotes(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(
        'Could not load quotes. If this is the first run, run database-service-quotes.sql in the Supabase SQL editor.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchQuotes();
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchQuotes(), 0);
    return () => clearTimeout(timer);
  }, []);

  // Live updates when a visitor sends a quote request.
  useEffect(() => {
    let channel;
    try {
      channel = supabase
        .channel('admin-service-quotes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'service_quotes' },
          () => fetchQuotes()
        )
        .subscribe();
    } catch (err) {
      console.error('Realtime subscription unavailable:', err);
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const patchQuote = async (id, patch) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    try {
      const { error: updateError } = await supabase
        .from('service_quotes')
        .update(patch)
        .eq('id', id);
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating quote:', err);
      fetchQuotes();
    }
  };

  const saveQuote = async (item) => {
    setSaving(true);
    const patch = {
      quoted_amount: quoteDraft.quoted_amount === '' ? null : Number(quoteDraft.quoted_amount),
      quoted_currency: quoteDraft.quoted_currency || 'USD',
      quote_notes: quoteDraft.quote_notes.trim() || null,
      deposit_paid: depositDraft === '' ? item.deposit_paid ?? 0 : Number(depositDraft),
      admin_notes: notesDraft,
      admin_notes_at: new Date().toISOString(),
    };
    await patchQuote(item.id, patch);
    setSaving(false);
  };

  const deleteQuote = async (id) => {
    if (!window.confirm('Delete this quote request permanently?')) return;
    try {
      const { error: deleteError } = await supabase.from('service_quotes').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  };

  const toggleExpand = (item) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    setQuoteDraft({
      quoted_amount: item.quoted_amount ?? '',
      quoted_currency: item.quoted_currency || 'USD',
      quote_notes: item.quote_notes || '',
    });
    setDepositDraft(item.deposit_paid ?? '');
    setNotesDraft(item.admin_notes || '');
  };

  const serviceOptions = useMemo(() => {
    const titles = new Set(quotes.map((q) => q.service_title).filter(Boolean));
    return [...titles];
  }, [quotes]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return quotes.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (serviceFilter !== 'all' && item.service_title !== serviceFilter) return false;
      if (!term) return true;
      return [item.full_name, item.email, item.company, item.service_title, item.project_summary, item.quote_id]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [quotes, statusFilter, serviceFilter, searchTerm]);

  const stats = useMemo(() => {
    const won = quotes.filter((q) => WON.includes(q.status));
    const pipeline = quotes
      .filter((q) => q.quoted_amount != null && !WON.includes(q.status))
      .reduce((sum, q) => sum + Number(q.quoted_amount), 0);
    return {
      total: quotes.length,
      newCount: quotes.filter((q) => q.status === 'new').length,
      quoted: quotes.filter((q) => q.quoted_amount != null).length,
      wonValue: won.reduce((sum, q) => sum + Number(q.quoted_amount || 0), 0),
      pipelineValue: pipeline,
    };
  }, [quotes]);

  const replyLink = (item) => {
    const subject = encodeURIComponent(`Your quote ${item.quote_id}: ${item.service_title || 'your project'}`);
    const body = encodeURIComponent(
      `Hi ${item.full_name},\n\nHere is the quote for ${item.service_title || 'your project'} (ref ${item.quote_id}):\n\n` +
        `Scope:\nPrice:\nTimeline:\n\nAny questions, reply here or WhatsApp +250 794 144 738.\n\nGENERAS CORE\n`
    );
    return `mailto:${item.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${text}`}>Quotes &amp; Orders</h1>
          <p className={`${textSub} mt-1`}>
            Who asked for what, what they were quoted, and where each deal stands
          </p>
        </div>
        <button onClick={handleRefresh} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${btnGhost}`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-gray-500`}>
          <p className={`${textMuted} text-sm`}>Requests</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.total}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-yellow-500`}>
          <p className={`${textMuted} text-sm`}>New</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.newCount}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-indigo-500`}>
          <p className={`${textMuted} text-sm`}>Quoted</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.quoted}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-green-500`}>
          <p className={`${textMuted} text-sm`}>Won value</p>
          <p className={`text-2xl font-bold ${text}`}>${money(stats.wonValue) || 0}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-purple-500`}>
          <p className={`${textMuted} text-sm`}>Open pipeline</p>
          <p className={`text-2xl font-bold ${text}`}>${money(stats.pipelineValue) || 0}</p>
        </div>
      </div>

      <div className={`${bg} rounded-xl border ${border} p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, service, reference or summary"
            className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
        >
          <option value="all">All services</option>
          {serviceOptions.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={`text-center py-12 ${textMuted}`}>Loading quote requests...</div>
      ) : filtered.length === 0 ? (
        <div className={`${bg} rounded-xl border ${border} p-12 text-center`}>
          <FileText className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
          <p className={`font-semibold ${text}`}>No quote requests yet</p>
          <p className={`text-sm ${textSub} mt-1`}>
            When someone uses "Get a quote" on the services page, it lands here with their budget and deadline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isOpen = expandedId === item.id;
            const amount = money(item.quoted_amount);

            return (
              <div key={item.id} className={`${bg} rounded-xl border ${border} overflow-hidden`}>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-bold ${text}`}>{item.service_title || 'Custom build'}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${STATUS_STYLES[item.status] || STATUS_STYLES.declined}`}>
                          {STATUS_LABEL[item.status] || item.status}
                        </span>
                        {item.custom_build && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 ring-1 ring-yellow-500/30 font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${textSub} mt-1`}>
                        {item.full_name}
                        {item.company && (
                          <>
                            {' · '}
                            <Building2 className="w-3.5 h-3.5 inline -mt-0.5" /> {item.company}
                          </>
                        )}
                        {' · '}
                        <span className="font-mono text-xs">{item.quote_id}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${textMuted}`}>{formatDate(item.created_at)}</p>
                      {amount !== null && (
                        <p className={`text-lg font-bold ${text}`}>
                          ${amount} <span className={`text-xs font-normal ${textMuted}`}>{item.quoted_currency}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <p className={`text-sm ${textSub} mt-3 line-clamp-2`}>{item.project_summary}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    {item.budget_band && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bgSub} ${textSub}`}>
                        <Wallet className="w-3.5 h-3.5" /> {item.budget_band}
                      </span>
                    )}
                    {item.deadline && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bgSub} ${textSub}`}>
                        <CalendarClock className="w-3.5 h-3.5" /> {item.deadline}
                      </span>
                    )}
                    {Number(item.deposit_paid) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/15 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" /> ${money(item.deposit_paid)} received
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <a href={`mailto:${item.email}`} className={`inline-flex items-center gap-1.5 text-sm font-medium ${linkAccent}`}>
                      <Mail className="w-4 h-4" /> {item.email}
                    </a>
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className={`inline-flex items-center gap-1.5 text-sm ${textSub}`}>
                        <Phone className="w-4 h-4" /> {item.phone}
                      </a>
                    )}
                    <button onClick={() => toggleExpand(item)} className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium ${btnGhost}`}>
                      {isOpen ? 'Hide details' : 'Open & quote'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className={`border-t ${border} ${bgSub} p-4 sm:p-5 space-y-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>Status</p>
                        <select
                          value={item.status}
                          onChange={(e) => patchQuote(item.id, { status: e.target.value })}
                          className={`mt-1 px-2 py-1.5 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>Your quote</p>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={quoteDraft.quoted_amount}
                            onChange={(e) => setQuoteDraft((d) => ({ ...d, quoted_amount: e.target.value }))}
                            placeholder="0.00"
                            className={`w-28 px-2 py-1.5 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                          />
                          <select
                            value={quoteDraft.quoted_currency}
                            onChange={(e) => setQuoteDraft((d) => ({ ...d, quoted_currency: e.target.value }))}
                            className={`px-2 py-1.5 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                          >
                            {['USD', 'RWF'].map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>Deposit received</p>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={depositDraft}
                          onChange={(e) => setDepositDraft(e.target.value)}
                          placeholder="0.00"
                          className={`mt-1 w-28 px-2 py-1.5 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                        />
                      </div>
                    </div>

                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>What they want</p>
                      <p className={`mt-1 text-sm whitespace-pre-wrap ${text}`}>{item.project_summary}</p>
                    </div>

                    {item.current_problem && (
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>What is failing today</p>
                        <p className={`mt-1 text-sm whitespace-pre-wrap ${text}`}>{item.current_problem}</p>
                      </div>
                    )}

                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Quote details (sent with your email)</p>
                      <textarea
                        value={quoteDraft.quote_notes}
                        onChange={(e) => setQuoteDraft((d) => ({ ...d, quote_notes: e.target.value }))}
                        rows={3}
                        placeholder="Scope, deliverables, timeline, what is not included..."
                        className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                      />
                    </div>

                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Private notes</p>
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        rows={2}
                        placeholder="Only visible in this dashboard."
                        className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => saveQuote(item)}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-gray-400"
                      >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save quote'}
                      </button>
                      <a href={replyLink(item)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${btnGhost}`}>
                        <Send className="w-4 h-4" /> Reply with the quote
                      </a>
                      <a
                        href={`https://wa.me/${(item.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${item.full_name}, about your quote request ${item.quote_id}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${btnGhost}`}
                      >
                        <ExternalLink className="w-4 h-4" /> WhatsApp
                      </a>
                      <button onClick={() => deleteQuote(item.id)} className={`ml-auto inline-flex items-center gap-1.5 text-sm font-medium ${dangerLink}`}>
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>

                    {item.quoted_at && (
                      <p className={`${textMuted} text-xs`}>Quoted on {formatDate(item.quoted_at)}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuotesManager;