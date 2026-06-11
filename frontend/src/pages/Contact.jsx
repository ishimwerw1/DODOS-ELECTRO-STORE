import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane, FaChevronRight, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Contact = () => {
  const { settings } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const whatsappNumber = (settings?.general?.whatsappNumber || '250783211453').replace(/\+/g, '');
    const text = `*New Contact Form Submission*%0A%0A*Name:* ${form.name}%0A*Email:* ${form.email}%0A*Subject:* ${form.subject}%0A*Message:* ${form.message}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    toast.success('Redirecting to WhatsApp...');
    setLoading(false);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const contactItems = [
    {
      icon: FaPhone,
      label: 'Call Us',
      value: settings?.general?.contactPhone || '+250 788 123 456',
      href: `tel:${settings?.general?.contactPhone || '+250788123456'}`,
      bg: 'bg-green-50', color: 'text-green-500', hoverBg: 'hover:bg-green-500',
    },
    {
      icon: FaEnvelope,
      label: 'Email Us',
      value: settings?.general?.contactEmail || 'dodoselectrostore@gmail.com',
      href: `mailto:${settings?.general?.contactEmail || 'dodoselectrostore@gmail.com'}`,
      bg: 'bg-blue-50', color: 'text-blue-500', hoverBg: 'hover:bg-blue-500',
    },
    {
      icon: FaMapMarkerAlt,
      label: 'Visit Us',
      value: settings?.general?.location || 'Kigali, Rwanda',
      href: null,
      bg: 'bg-red-50', color: 'text-red-500', hoverBg: 'hover:bg-red-500',
    },
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      value: 'Chat with us',
      href: `https://wa.me/${(settings?.general?.whatsappNumber || '250783211453').replace(/\+/g, '')}`,
      bg: 'bg-green-50', color: 'text-green-500', hoverBg: 'hover:bg-green-500',
      external: true,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FaChevronRight size={8} />
          <span className="text-gray-700">Contact</span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Get in Touch</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Have questions about our products or need assistance? We're here to help!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Contact Info ── */}
          <div className="space-y-5">
            {/* Contact cards */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-black text-gray-900 mb-5">Contact Information</h3>
              <div className="space-y-4">
                {contactItems.map((item, i) => {
                  const content = (
                    <div className="flex items-center gap-3 group">
                      <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center text-base group-hover:bg-green-500 group-hover:text-white transition-all flex-shrink-0`}>
                        <item.icon size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                        <p className="font-semibold text-gray-800 text-sm group-hover:text-green-600 transition-colors">{item.value}</p>
                      </div>
                    </div>
                  );
                  if (item.href) {
                    return item.external
                      ? <a key={i} href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>
                      : <a key={i} href={item.href}>{content}</a>;
                  }
                  return <div key={i}>{content}</div>;
                })}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gray-900 text-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaClock className="text-green-400" size={14} />
                <h3 className="text-base font-black">Business Hours</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  { day: 'Monday – Friday', hours: '8:00 AM – 10:00 PM' },
                  { day: 'Saturday',        hours: '8:00 AM – 10:00 PM' },
                  { day: 'Sunday',          hours: '8:00 AM – 8:00 PM', highlight: true },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-400">{row.day}:</span>
                    <span className={`font-bold ${row.highlight ? 'text-green-400' : 'text-white'}`}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                title="Dodos Electro Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63799.41051493849!2d30.0445!3d-1.9440727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1700000000000"
                width="100%" height="200"
                style={{ border: 0, display: 'block' }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-8 h-full">
              <h3 className="text-lg font-black text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-800"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-800"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Subject</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all text-sm text-gray-800"
                    placeholder="Product Inquiry"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea
                    required rows="6"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 outline-none transition-all resize-none text-sm text-gray-800"
                    placeholder="Tell us what you need..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-sm shadow-green-500/20"
                >
                  {loading ? 'Processing...' : <><FaPaperPlane size={14} /> Send via WhatsApp</>}
                </button>
                <p className="text-center text-xs text-gray-400">Clicking send will open WhatsApp with your message pre-filled.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
