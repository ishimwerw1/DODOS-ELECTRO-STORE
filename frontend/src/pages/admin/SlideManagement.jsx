import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaEye, FaEyeSlash, FaLink } from 'react-icons/fa';
import { slideAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const BADGE_OPTIONS = ['NEW ARRIVAL', 'HOT DEAL', 'LIMITED OFFER', 'BEST SELLER', 'SALE', 'FEATURED'];
const emptyForm = { title: '', subtitle: '', image: '', badge: 'NEW ARRIVAL', price: '', isActive: true, order: 0 };

const SlideManagement = () => {
  const [slides, setSlides]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData]         = useState(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [deleteId, setDeleteId]         = useState(null);

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await slideAPI.getAllSlides();
      setSlides(res.data || []);
    } catch { toast.error('Failed to load slides'); }
    finally { setLoading(false); }
  };

  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({ title: slide.title || '', subtitle: slide.subtitle || '', image: slide.image || '', badge: slide.badge || 'NEW ARRIVAL', price: slide.price || '', isActive: slide.isActive !== false, order: slide.order ?? 0 });
    } else {
      setEditingSlide(null);
      setFormData({ ...emptyForm, order: slides.length });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingSlide(null); };
  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB for 4K quality
        return toast.error('Image size should be less than 20MB for HD quality');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        set('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image.trim()) return toast.error('Please enter an image URL');
    setSaving(true);
    try {
      if (editingSlide) {
        await slideAPI.updateSlide(editingSlide._id, formData);
        toast.success('Slide updated');
      } else {
        await slideAPI.createSlide(formData);
        toast.success('Slide created');
      }
      closeModal();
      fetchSlides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    setDeleteId(id);
    try {
      await slideAPI.deleteSlide(id);
      toast.success('Slide deleted');
      fetchSlides();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteId(null); }
  };

  const toggleActive = async (slide) => {
    try {
      await slideAPI.updateSlide(slide._id, { isActive: !slide.isActive });
      toast.success(`Slide ${!slide.isActive ? 'activated' : 'deactivated'}`);
      fetchSlides();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Slideshow Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage homepage hero banner slides</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 btn-glow text-white px-5 py-2.5 rounded-xl font-bold text-sm">
          <FaPlus size={12} /> Add Slide
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: slides.length, color: 'text-blue-400' },
          { label: 'Active', value: slides.filter(s => s.isActive).length, color: 'text-green-400' },
          { label: 'Inactive', value: slides.filter(s => !s.isActive).length, color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-white/5 p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 glass rounded-2xl border border-white/5 animate-pulse" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 py-20 text-center">
          <FaImage size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-semibold">No slides yet.</p>
          <button onClick={() => openModal()} className="mt-4 btn-glow text-white px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2">
            <FaPlus size={11} /> Add Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {slides.map(slide => (
            <motion.div key={slide._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`glass rounded-2xl border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all ${!slide.isActive ? 'opacity-50' : ''}`}>
              <div className="relative h-44 bg-white/5 overflow-hidden">
                {slide.image ? (
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.style.display='none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FaImage size={32} className="text-slate-600" /></div>
                )}
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{slide.badge}</span>
                <span className={`absolute top-3 right-3 text-[9px] font-black px-2.5 py-1 rounded-lg border ${slide.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                  {slide.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">#{slide.order + 1}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm truncate">{slide.title}</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">{slide.subtitle}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => openModal(slide)} className="flex-1 flex items-center justify-center gap-1.5 py-2 glass border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 rounded-xl text-xs font-semibold transition-all">
                    <FaEdit size={11} /> Edit
                  </button>
                  <button onClick={() => toggleActive(slide)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border glass border-white/10 ${slide.isActive ? 'text-green-400' : 'text-slate-400 hover:text-green-400'}`}>
                    {slide.isActive ? <FaEye size={11} /> : <FaEyeSlash size={11} />} {slide.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => handleDelete(slide._id)} disabled={deleteId === slide._id} className="w-9 h-9 flex items-center justify-center glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all">
                    {deleteId === slide._id ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <FaTrash size={11} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="relative w-full max-w-2xl glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <h3 className="font-black text-white text-base">{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Fill in the slide details below</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 glass border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <FaTimes size={12} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                {/* Image URL */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <FaLink size={9} className="inline mr-1.5" />Image URL / Upload *
                  </label>
                  <div className="flex gap-2">
                    <input type="url" value={formData.image} onChange={e => set('image', e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="flex-1 input-dark rounded-xl px-4 py-3 text-sm" required />
                    <label className="cursor-pointer glass border border-white/10 hover:border-blue-500/50 rounded-xl px-4 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all">
                      <FaPlus size={14} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 h-36 bg-white/5">
                      <img src={formData.image} alt="preview" className="w-full h-full object-cover"
                        onError={e => { e.target.style.display='none'; }} />
                    </div>
                  )}
                </div>
                {/* Title */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Title *</label>
                  <input type="text" value={formData.title} onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Premium iPhone Screens" className="w-full input-dark rounded-xl px-4 py-3 text-sm" required />
                </div>
                {/* Subtitle */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Subtitle *</label>
                  <input type="text" value={formData.subtitle} onChange={e => set('subtitle', e.target.value)}
                    placeholder="e.g. Ultra-durable tempered glass" className="w-full input-dark rounded-xl px-4 py-3 text-sm" required />
                </div>
                {/* Badge + Price + Order */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Badge</label>
                    <select value={formData.badge} onChange={e => set('badge', e.target.value)} className="w-full input-dark rounded-xl px-3 py-3 text-sm">
                      {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Price (optional)</label>
                    <input type="text" value={formData.price} onChange={e => set('price', e.target.value)}
                      placeholder="e.g. 15,000" className="w-full input-dark rounded-xl px-3 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Order</label>
                    <input type="number" min="0" value={formData.order} onChange={e => set('order', parseInt(e.target.value) || 0)}
                      className="w-full input-dark rounded-xl px-3 py-3 text-sm" />
                  </div>
                </div>
                {/* Active toggle */}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => set('isActive', !formData.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-white/10'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-slate-400 font-semibold">
                    {formData.isActive ? 'Active — visible on homepage' : 'Inactive — hidden from homepage'}
                  </span>
                </div>
                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 glass border border-white/10 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 btn-glow text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                    {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : editingSlide ? 'Save Changes' : 'Create Slide'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideManagement;
