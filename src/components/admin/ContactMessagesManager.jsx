import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquare, Mail, Phone, Search, 
  RefreshCw, Clock, Trash2, CheckCircle
} from 'lucide-react';

const ContactMessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
        msg.message?.toLowerCase().includes(term)
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Contact Messages</h1>
        <p className="text-gray-600 mt-1">Messages submitted through the contact form</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-500">
          <p className="text-gray-500 text-sm">Total Messages</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Unread</p>
          <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Read</p>
          <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                !msg.is_read ? 'border-l-4 border-yellow-400' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-gray-900">{msg.name}</h3>
                      {!msg.is_read && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unread
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {!msg.is_read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
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
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {selectedMessage?.id === msg.id ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {selectedMessage?.id === msg.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-2">Full Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline text-sm">
                        Reply via Email
                      </a>
                      {msg.phone && (
                        <a href={`tel:${msg.phone}`} className="text-blue-600 hover:underline text-sm">
                          Call
                        </a>
                      )}
                      <button onClick={() => deleteMessage(msg.id)} className="text-red-600 hover:underline text-sm flex items-center gap-1 ml-auto">
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
