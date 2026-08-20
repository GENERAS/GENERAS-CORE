import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquare, Mail, Phone, MapPin, Building, 
  Search, Filter, RefreshCw, ExternalLink, Tag,
  Clock, Globe, Briefcase, DollarSign, Trash2
} from 'lucide-react';

const AiLeadsManager = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching AI leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadLabel = async (id, label) => {
    try {
      const { error } = await supabase
        .from('ai_leads')
        .update({ lead_label: label })
        .eq('id', id);

      if (error) throw error;
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      const { error } = await supabase
        .from('ai_leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter !== 'all' && lead.lead_label !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.phone?.includes(term) ||
        lead.whatsapp?.includes(term) ||
        lead.company?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.lead_label === 'new').length,
    hot: leads.filter(l => l.lead_label === 'hot').length,
    warm: leads.filter(l => l.lead_label === 'warm').length,
    cold: leads.filter(l => l.lead_label === 'cold').length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Assistant Leads</h1>
        <p className="text-gray-600 mt-1">Leads captured by the AI chatbot and website audit form</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-500">
          <p className="text-gray-500 text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-400">
          <p className="text-gray-500 text-sm">New</p>
          <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Hot</p>
          <p className="text-2xl font-bold text-gray-900">{stats.hot}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Warm</p>
          <p className="text-2xl font-bold text-gray-900">{stats.warm}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Cold</p>
          <p className="text-2xl font-bold text-gray-900">{stats.cold}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'new', 'hot', 'warm', 'cold'].map(f => (
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
            onClick={fetchLeads}
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
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No leads found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-gray-900">{lead.name || 'Anonymous'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLabelColor(lead.lead_label)}`}>
                        {lead.lead_label || 'new'}
                      </span>
                      {lead.source && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {lead.source}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.whatsapp && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp: {lead.whatsapp}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {lead.company}
                        </div>
                      )}
                      {lead.industry && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {lead.industry}
                        </div>
                      )}
                      {lead.website_url && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {lead.website_url.replace(/^https?:\/\//, '').substring(0, 30)}...
                          </a>
                        </div>
                      )}
                      {lead.budget_range && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {lead.budget_range}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <select
                      value={lead.lead_label || 'new'}
                      onChange={(e) => updateLeadLabel(lead.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="new">New</option>
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                    <button
                      onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {selectedLead?.id === lead.id ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {selectedLead?.id === lead.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Lead Details</h4>
                        <div className="space-y-2 text-sm">
                          {lead.project_type && <p className="text-gray-900"><span className="text-gray-600 font-medium">Project Type:</span> {lead.project_type}</p>}
                          {lead.user_type && <p className="text-gray-900"><span className="text-gray-600 font-medium">User Type:</span> {lead.user_type}</p>}
                          {lead.location && <p className="text-gray-900"><span className="text-gray-600 font-medium">Location:</span> {lead.location}</p>}
                          {lead.message && <p className="text-gray-900"><span className="text-gray-600 font-medium">Message:</span> {lead.message}</p>}
                          {lead.project_brief && <p className="text-gray-900"><span className="text-gray-600 font-medium">Project Brief:</span> {lead.project_brief}</p>}
                        </div>
                      </div>
                      <div>
                        {lead.chat_transcript && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Chat Transcript</h4>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm max-h-48 overflow-y-auto text-gray-900">
                              {lead.chat_transcript}
                            </div>
                          </div>
                        )}
                        {lead.discovery_answers && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Discovery Answers</h4>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900">
                              {typeof lead.discovery_answers === 'object'
                                ? JSON.stringify(lead.discovery_answers, null, 2)
                                : lead.discovery_answers}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline text-sm">Send Email</a>
                      )}
                      {lead.whatsapp && (
                        <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm flex items-center gap-1">
                          WhatsApp <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button onClick={() => deleteLead(lead.id)} className="text-red-600 hover:underline text-sm flex items-center gap-1 ml-auto">
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

export default AiLeadsManager;
