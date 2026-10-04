import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import {
  Handshake, Mail, Phone, Building2, Search, RefreshCw, Trash2,
  Save, ExternalLink, Layers, Wallet, CalendarClock, Sparkles,
} from 'lucide-react';
import { COLLABORATION_TYPES } from '../collaboration/collaborationOptions';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'active', label: 'Active' },
  { value: 'declined', label: 'Declined' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));

const STATUS_STYLES = {
  new: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 ring-yellow-500/30',
  reviewing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 ring-blue-500/30',
  contacted: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 ring-purple-500/30',
  active: 'bg-green-500/15 text-green-700 dark:text-green-400 ring-green-500/30',
  declined: 'bg-red-500/15 text-red-700 dark:text-red-400 ring-red-500/30',
  archived: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 ring-gray-500/30',
};

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

const CollaborationManager = () => {
  const { isDark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

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

  // NOTE: no setState before the first await in here - this is called straight
  // from an effect, and synchronous setState there causes cascading renders.
  const fetchRequests = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('collaboration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching collaboration requests:', err);
      setError(
        'Could not load collaboration requests. If this is the first run, run database-collaboration-requests.sql in the Supabase SQL editor.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchRequests();
  };

  useEffect(() => {
    // Deferred by one tick: fetching on mount writes state, and doing that
    // synchronously in the effect body causes a cascading render.
    const timer = setTimeout(() => fetchRequests(), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Realtime keeps the inbox (and the sidebar badge) live when a proposal
    // arrives. The channel is only useful once the table exists.
    let channel;
    try {
      channel = supabase
        .channel('admin-collaboration-requests')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'collaboration_requests' },
          () => fetchRequests()
        )
        .subscribe();
    } catch (err) {
      console.error('Realtime subscription unavailable:', err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id, status) => {
    setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      const { error: updateError } = await supabase
        .from('collaboration_requests')
        .update({ status })
        .eq('id', id);
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating status:', err);
      fetchRequests();
    }
  };

  const saveNotes = async (id) => {
    setSavingNotes(true);
    try {
      const { error: updateError } = await supabase
        .from('collaboration_requests')
        .update({ admin_notes: notesDraft, admin_notes_at: new Date().toISOString() })
        .eq('id', id);
      if (updateError) throw updateError;
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, admin_notes: notesDraft, admin_notes_at: new Date().toISOString() } : item
        )
      );
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this collaboration request permanently?')) return;
    try {
      const { error: deleteError } = await supabase
        .from('collaboration_requests')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setRequests((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const toggleExpand = (item) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    setNotesDraft(item.admin_notes || '');
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return requests.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item.collaboration_type !== typeFilter) return false;
      if (!term) return true;
      return [item.full_name, item.email, item.company, item.project_title, item.project_summary]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [requests, statusFilter, typeFilter, searchTerm]);

  const stats = {
    total: requests.length,
    new: requests.filter((item) => item.status === 'new').length,
    inProgress: requests.filter((item) => ['reviewing', 'contacted', 'active'].includes(item.status)).length,
    closed: requests.filter((item) => ['declined', 'archived'].includes(item.status)).length,
  };

  const replyLink = (item) => {
    const subject = encodeURIComponent(`Re: your proposal - ${item.project_title}`);
    const body = encodeURIComponent(
      `Hi ${item.full_name},\n\nThanks for sending this over. I read your proposal "${item.project_title}".\n\n`
    );
    return `mailto:${item.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${text}`}>Collaboration Requests</h1>
          <p className={`${textSub} mt-1`}>People who sent a project, an idea, or an offer to work together</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-gray-500`}>
          <p className={`${textMuted} text-sm`}>Total Requests</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.total}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-yellow-500`}>
          <p className={`${textMuted} text-sm`}>New</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.new}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-green-500`}>
          <p className={`${textMuted} text-sm`}>In Progress</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.inProgress}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-red-500`}>
          <p className={`${textMuted} text-sm`}>Closed</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.closed}</p>
        </div>
      </div>

      <div className={`${bg} rounded-xl border ${border} p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, company, title or summary"
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
        >
          <option value="all">All types</option>
          {COLLABORATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={`text-center py-12 ${textMuted}`}>Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className={`${bg} rounded-xl border ${border} p-12 text-center`}>
          <Handshake className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
          <p className={`font-semibold ${text}`}>Nothing here yet</p>
          <p className={`text-sm ${textSub} mt-1`}>
            Proposals sent from the "Start a Project" page land here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const typeLabel =
              COLLABORATION_TYPES.find((t) => t.value === item.collaboration_type)?.label || item.collaboration_type;
            const isOpen = expandedId === item.id;

            return (
              <div key={item.id} className={`${bg} rounded-xl border ${border} overflow-hidden`}>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-bold ${text}`}>{item.project_title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ring-1 font-medium ${STATUS_STYLES[item.status] || STATUS_STYLES.archived}`}>
                          {STATUS_LABEL[item.status] || item.status}
                        </span>
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
                        <Sparkles className="w-3.5 h-3.5 inline -mt-0.5" /> {typeLabel}
                      </p>
                    </div>
                    <p className={`text-xs ${textMuted}`}>{formatDate(item.created_at)}</p>
                  </div>

                  <p className={`text-sm ${textSub} mt-3 line-clamp-2`}>{item.project_summary}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    {item.tech_stack && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bgSub} ${textSub}`}>
                        <Layers className="w-3.5 h-3.5" /> {item.tech_stack}
                      </span>
                    )}
                    {item.budget_range && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bgSub} ${textSub}`}>
                        <Wallet className="w-3.5 h-3.5" /> {item.budget_range}
                      </span>
                    )}
                    {item.timeline && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bgSub} ${textSub}`}>
                        <CalendarClock className="w-3.5 h-3.5" /> {item.timeline}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <a href={`mailto:${item.email}`} className={`inline-flex items-center gap-1.5 text-sm font-medium ${linkAccent}`}>
                      <Mail className="w-4 h-4" /> {item.email}
                    </a>
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className={`inline-flex items-center gap-1.5 text-sm ${textSub}`}>
                        <Phone className="w-4 h-4" /> {item.phone}
                      </a>
                    )}
                    <button onClick={() => toggleExpand(item)} className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium ${btnGhost}`}>
                      {isOpen ? 'Hide details' : 'View details'}
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
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className={`mt-1 px-2 py-1.5 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>Submitted</p>
                        <p className={`mt-1 ${text}`}>{formatDate(item.created_at)}</p>
                      </div>
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>Links</p>
                        {item.links ? (
                          <a
                            href={item.links.startsWith('http') ? item.links : `https://${item.links}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 mt-1 text-sm font-medium ${linkAccent}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open link
                          </a>
                        ) : (
                          <p className={`mt-1 ${text}`}>-</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Full proposal</p>
                      <p className={`mt-1 text-sm whitespace-pre-wrap ${text}`}>{item.project_summary}</p>
                    </div>

                    {item.what_they_bring && (
                      <div>
                        <p className={`${textMuted} text-xs uppercase tracking-wide`}>What they bring</p>
                        <p className={`mt-1 text-sm whitespace-pre-wrap ${text}`}>{item.what_they_bring}</p>
                      </div>
                    )}

                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Private notes</p>
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        rows={3}
                        placeholder="Only visible in this dashboard."
                        className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-yellow-500 ${inputBg}`}
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <button
                          onClick={() => saveNotes(item.id)}
                          disabled={savingNotes}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-gray-400"
                        >
                          <Save className="w-4 h-4" /> {savingNotes ? 'Saving...' : 'Save notes'}
                        </button>
                        <a href={replyLink(item)} className={`inline-flex items-center gap-1.5 text-sm font-medium ${linkAccent}`}>
                          <Mail className="w-4 h-4" /> Reply by email
                        </a>
                        <button onClick={() => deleteRequest(item.id)} className={`ml-auto inline-flex items-center gap-1.5 text-sm font-medium ${dangerLink}`}>
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                      {item.admin_notes_at && (
                        <p className={`${textMuted} text-xs mt-2`}>Notes last updated {formatDate(item.admin_notes_at)}</p>
                      )}
                    </div>
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

export default CollaborationManager;