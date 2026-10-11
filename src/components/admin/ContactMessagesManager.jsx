import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { DIVISION_BY_SLUG } from '../../data/coreBrand';
import { 
  MessageSquare, Mail, Phone, Search, 
  RefreshCw, Clock, Trash2, CheckCircle, Building2
} from 'lucide-react';

const ContactMessagesManager = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const bg = isDark ? 'bg-gray-800' : 'bg-white'
  const bgSub = isDark ? 'bg-gray-700/50' : 'bg-gray-50'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const text = isDark ? 'text-white' : 'text-gray-900'
  const textSub = isDark ? 'text-gray-300' : 'text-gray-600'
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500'
  const inputBg = isDark ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const focusRing = 'focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500'
  const pageBg = isDark ? 'bg-gray-900' : 'bg-gray-50'
  const pillInactive = isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  const btnGhost = isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  const btnOutline = isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
  const linkAccent = isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'
  const dangerLink = isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread' && msg.is_read) return false;
    if (filter === 'read' && !msg.is_read) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        msg.name?.toLowerCase().includes(term) ||
        msg.email?.toLowerCase().includes(term) ||
        msg.phone?.includes(term) ||
        msg.message?.toLowerCase().includes(term) ||
        msg.division?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.is_read).length,
    read: messages.filter(m => m.is_read).length,
  };

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${text}`}>Contact Messages</h1>
        <p className={`${textSub} mt-1`}>Messages submitted through the contact form</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-gray-500`}>
          <p className={`${textMuted} text-sm`}>Total Messages</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.total}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-yellow-500`}>
          <p className={`${textMuted} text-sm`}>Unread</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.unread}</p>
        </div>
        <div className={`${bg} rounded-xl shadow-sm p-4 border ${border} border-l-4 border-l-green-500`}>
          <p className={`${textMuted} text-sm`}>Read</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.read}</p>
        </div>
      </div>

      <div className={`${bg} rounded-xl shadow-sm p-4 mb-6 border ${border}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name, email, phone, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 border rounded-lg outline-none transition-colors ${inputBg} ${focusRing}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-yellow-600 text-white hover:bg-yellow-700' : pillInactive
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchMessages}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${btnGhost}`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className={`${bg} rounded-xl shadow-sm p-12 text-center border ${border}`}>
          <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={textMuted}>No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`${bg} rounded-xl shadow-sm hover:shadow-md transition-shadow border ${border} ${
                !msg.is_read ? 'border-l-4 border-l-yellow-400' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className={`font-semibold text-lg ${text}`}>{msg.name}</h3>
                      {!msg.is_read && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                          Unread
                        </span>
                      )}
                      {msg.division && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                          <Building2 className="w-3 h-3" />
                          {DIVISION_BY_SLUG[msg.division]?.name || msg.division}
                        </span>
                      )}
                    </div>
                    <div className={`flex flex-wrap gap-4 text-sm ${textSub}`}>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {msg.email}
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {msg.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className={`mt-2 text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{msg.message}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {!msg.is_read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!msg.is_read) markAsRead(msg.id);
                        setSelectedMessage(selectedMessage?.id === msg.id ? null : msg);
                      }}
                      className={`px-4 py-2 border rounded-lg transition-colors ${btnOutline}`}
                    >
                      {selectedMessage?.id === msg.id ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {selectedMessage?.id === msg.id && (
                  <div className={`mt-4 pt-4 border-t ${border}`}>
                    <h4 className={`font-semibold mb-2 ${text}`}>Full Message</h4>
                    <div className={`${bgSub} rounded-lg p-4 text-sm whitespace-pre-wrap ${text}`}>
                      {msg.message}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <a href={`mailto:${msg.email}`} className={`${linkAccent} text-sm`}>
                        Reply via Email
                      </a>
                      {msg.phone && (
                        <a href={`tel:${msg.phone}`} className={`${linkAccent} text-sm`}>
                          Call
                        </a>
                      )}
                      <button onClick={() => deleteMessage(msg.id)} className={`${dangerLink} text-sm flex items-center gap-1 ml-auto`}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManager;
