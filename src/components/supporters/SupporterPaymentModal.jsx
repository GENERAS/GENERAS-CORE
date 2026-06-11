import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FaCoffee, FaTimes, FaCheckCircle
} from 'react-icons/fa';

export default function SupporterPaymentModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supporterId, setSupporterId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await supabase
        .from('coffee_supporters')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cups: 1,
          amount: 0,
          show_in_hall: false,
          level: 'bronze'
        }])
        .select()
        .single();

      if (result.error) throw result.error;

      setSupporterId(result.data.id);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting supporter:', err);
      setError('Failed to submit. Please try again: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setFormData({ name: '', phone: '', email: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[100] p-4 pt-20">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-200 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <FaCoffee className="text-amber-500" />
            Buy Me a Coffee
          </h2>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Info */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-700 font-medium mb-1">
                  Send money to this MTN Mobile Money number:
                </p>
                <p className="text-3xl font-bold text-amber-600 tracking-wider">0794144738</p>
                <p className="text-sm text-gray-500 mt-1">KAGIRANEZA GENERAS</p>
              </div>

              <p className="text-sm text-gray-500 text-center">After paying, fill in your details below</p>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Your Names *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="079XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.name || !formData.phone || !formData.email}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
              <p className="text-gray-600">
                Your payment has been submitted and is awaiting verification.
                Once confirmed, you'll appear in the Supporters Hall!
              </p>
              <div className="bg-gray-100 rounded-lg p-4 text-sm border border-gray-200">
                <p className="text-gray-500">Reference ID:</p>
                <p className="font-mono text-amber-600">{supporterId}</p>
              </div>
              <button
                onClick={resetAndClose}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
