import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { usdToRwf } from '../../utils/currency';
import { 
  FaCoffee, FaTimes, FaUpload, FaCheckCircle, FaInstagram, 
  FaTwitter, FaFacebook, FaLinkedin, FaGlobe, FaPhone, FaUser,
  FaGem, FaMedal, FaTrophy, FaCrown, FaStar
} from 'react-icons/fa';

export default function SupporterPaymentModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: info, 2: payment details, 3: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supporterId, setSupporterId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cups: 1,
    message: '',
    sender_phone: '',
    payment_reference: '',
    payment_screenshot: null,
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    website: '',
    phone: ''
  });

  const CUP_PRICE = 1; // $1 per coffee

  // Get prize tier based on amount
  const getPrizeTier = (amount) => {
    if (amount >= 100) return { name: 'Platinum', icon: FaGem, color: 'text-purple-400', bg: 'bg-purple-600/20', border: 'border-purple-500' };
    if (amount >= 51) return { name: 'Gold', icon: FaTrophy, color: 'text-amber-400', bg: 'bg-amber-600/20', border: 'border-amber-500' };
    if (amount >= 11) return { name: 'Silver', icon: FaMedal, color: 'text-gray-300', bg: 'bg-gray-600/20', border: 'border-gray-500' };
    return { name: 'Bronze', icon: FaStar, color: 'text-amber-700', bg: 'bg-amber-900/20', border: 'border-amber-700' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFormData(prev => ({ ...prev, payment_screenshot: file }));
    setError('');
  };

  const uploadScreenshot = async () => {
    if (!formData.payment_screenshot) return null;
    
    try {
      const fileExt = formData.payment_screenshot.name.split('.').pop();
      const fileName = `supporter-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, formData.payment_screenshot);
      
      if (uploadError) {
        console.warn('Screenshot upload failed:', uploadError.message);
        return null; // Continue without screenshot
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (err) {
      console.warn('Screenshot upload error:', err.message);
      return null; // Continue without screenshot
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload screenshot if provided
      let screenshotUrl = null;
      if (formData.payment_screenshot) {
        screenshotUrl = await uploadScreenshot();
      }

      const amount = parseInt(formData.cups) * CUP_PRICE;
      const tier = getPrizeTier(amount);
      
      // Build full insert data with social media
      const fullInsertData = {
        name: formData.name,
        email: formData.email,
        cups: parseInt(formData.cups),
        message: formData.message,
        amount: amount,
        show_in_hall: false,
        level: tier.name.toLowerCase(),
        payment_reference: formData.payment_reference,
        sender_phone: formData.sender_phone,
        payment_screenshot_url: screenshotUrl,
        // Social media fields
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        facebook: formData.facebook || null,
        linkedin: formData.linkedin || null,
        website: formData.website || null,
        phone: formData.phone || null
      };
      
      // Try inserting with all fields first
      let result = await supabase
        .from('coffee_supporters')
        .insert([fullInsertData])
        .select()
        .single();
      
      // If failed due to missing columns, retry without social media fields
      if (result.error && result.error.message.includes('column')) {
        console.warn('Social media columns not found, retrying without them:', result.error.message);
        
        const coreInsertData = {
          name: formData.name,
          email: formData.email,
          cups: parseInt(formData.cups),
          message: formData.message,
          amount: amount,
          show_in_hall: false,
          level: tier.name.toLowerCase(),
          payment_reference: formData.payment_reference,
          sender_phone: formData.sender_phone,
          payment_screenshot_url: screenshotUrl
        };
        
        result = await supabase
          .from('coffee_supporters')
          .insert([coreInsertData])
          .select()
          .single();
          
        if (result.error) throw result.error;
        
        // Show warning that social media wasn't saved
        console.warn('Note: Social media links were not saved. Please run the schema update SQL.');
      } else if (result.error) {
        throw result.error;
      }

      setSupporterId(result.data.id);
      setStep(3); // Success
    } catch (err) {
      console.error('Error submitting supporter:', err);
      setError('Failed to submit. Please try again: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      cups: 1,
      message: '',
      sender_phone: '',
      payment_reference: '',
      payment_screenshot: null,
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      website: '',
      phone: ''
    });
    setError('');
    onClose();
  };

  const amount = formData.cups * CUP_PRICE;
  const tier = getPrizeTier(amount);
  const TierIcon = tier.icon;

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
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center">
                Support my work and get featured in the Supporters Hall!
              </p>

              {/* Cup Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">How many coffees? ($1 / {usdToRwf(1).toLocaleString()} RWF each)</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, cups: Math.max(1, p.cups - 1) }))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-gray-900">{formData.cups} ☕</span>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, cups: Math.min(50, p.cups + 1) }))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
                <p className="text-amber-400 font-semibold mt-2">Total: ${formData.cups * CUP_PRICE} ({usdToRwf(formData.cups * CUP_PRICE).toLocaleString()} RWF)</p>
                
                {/* Prize Tier Preview */}
                <div className={`mt-3 p-3 rounded-lg ${tier.bg} border ${tier.border}`}>
                  <div className={`flex items-center gap-2 ${tier.color}`}>
                    <TierIcon size={20} />
                    <span className="font-bold">{tier.name} Supporter</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {amount >= 100 ? 'Elite tier - Maximum visibility in Hall of Fame' :
                     amount >= 51 ? 'Featured with social links in Supporters Hall' :
                     amount >= 11 ? 'Highlighted profile in Supporters Hall' :
                     'Listed in Bronze Supporters section'}
                  </p>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Your Name *</label>
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
                <label className="block text-sm font-medium mb-1 text-gray-700">Your Email *</label>
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

              {/* Social Media Links */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium mb-3 text-gray-700">Your Social Links (Optional - Public)</p>
                <p className="text-xs text-gray-500 mb-3">These will be visible on your Supporters Hall profile</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <FaInstagram className="text-pink-500" />
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <FaTwitter className="text-blue-400" />
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <FaFacebook className="text-blue-600" />
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <FaLinkedin className="text-blue-500" />
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 col-span-2">
                    <FaGlobe className="text-green-500" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Public Phone (Optional)</label>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                  <FaPhone className="text-green-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your public contact number"
                    className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Message (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="Leave a public message of support..."
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Send ${formData.cups} ({usdToRwf(formData.cups).toLocaleString()} RWF) to MTN Mobile Money:
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">0794144738</p>
                <p className="text-sm text-gray-500 mt-1">(Generas Kagiraneza)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Your MTN Phone Number *</label>
                <input
                  type="tel"
                  name="sender_phone"
                  value={formData.sender_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="079XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Transaction Reference *</label>
                <input
                  type="text"
                  name="payment_reference"
                  value={formData.payment_reference}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 1234567890"
                />
                <p className="text-xs text-gray-500 mt-1">Found in your MTN confirmation SMS</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Payment Screenshot (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="flex items-center gap-2 w-full bg-white border border-gray-300 border-dashed rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <FaUpload className="text-amber-500" />
                    <span className="text-gray-500">
                      {formData.payment_screenshot ? formData.payment_screenshot.name : 'Upload payment screenshot'}
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.sender_phone || !formData.payment_reference}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
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
