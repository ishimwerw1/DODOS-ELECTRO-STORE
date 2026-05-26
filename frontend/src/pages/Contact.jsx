import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Contact = () => {
  const { settings } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const whatsappNumber = settings?.general?.whatsappNumber || '250788206064';
    const cleanNumber = whatsappNumber.replace(/\+/g, '');
    
    const text = `*New Contact Form Submission*%0A%0A*Name:* ${form.name}%0A*Email:* ${form.email}%0A*Subject:* ${form.subject}%0A*Message:* ${form.message}`;
    
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${text}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecting to WhatsApp...');
    setLoading(false);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-dark uppercase tracking-tighter mb-4">Get in Touch</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Have questions about our products or need assistance? We're here to help! 
            Fill out the form below or contact us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Contact Info, Business Hours, Map */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-8">Contact Information</h3>
              
              <div className="space-y-6">
                <a 
                  href={`tel:${settings?.general?.contactPhone || '+250788123456'}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-black transition-all">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Call Us</p>
                    <p className="font-bold text-dark">{settings?.general?.contactPhone || '+250 788 123 456'}</p>
                  </div>
                </a>

                <a 
                  href={`mailto:${settings?.general?.contactEmail || 'dodoselectrostore@gmail.com'}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Us</p>
                    <p className="font-bold text-dark break-all">{settings?.general?.contactEmail || 'dodoselectrostore@gmail.com'}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visit Us</p>
                    <p className="font-bold text-dark">{settings?.general?.location || 'Kigali, Rwanda'}</p>
                  </div>
                </div>

                <a 
                  href={`https://wa.me/${(settings?.general?.whatsappNumber || '250788206064').replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-xl group-hover:bg-green-500 group-hover:text-white transition-all">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">WhatsApp</p>
                    <p className="font-bold text-dark">Chat with us</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-dark text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-xl font-bold mb-6">Business Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monday – Friday:</span>
                  <span className="font-bold">8:00 AM – 10:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Saturday:</span>
                  <span className="font-bold">8:00 AM – 10:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sunday:</span>
                  <span className="font-bold text-yellow-400">8:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <iframe
                title="Dodos Electro Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63799.41051493849!2d30.0445!3d-1.9440727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1700000000000"
                width="100%"
                height="220"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Product Inquiry"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea 
                    required
                    rows="5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Tell us what you need..."
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-black font-black py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : <><FaPaperPlane /> Send via WhatsApp</>}
                </button>
                <p className="text-center text-xs text-gray-400">
                  Clicking send will open WhatsApp with your message pre-filled.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;