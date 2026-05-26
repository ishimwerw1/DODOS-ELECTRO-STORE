import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaLayerGroup, FaCheckCircle, FaTimes, FaFilter, FaArrowLeft, FaChevronDown, FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryManagement = () => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', isActive: true, highlightedHome: false });

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getAllCategories();
      setCategories(res.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB for 4K quality
        return toast.error('Image size should be less than 20MB for HD quality');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description || '', 
        image: category.image || '',
        isActive: category.isActive !== false,
        highlightedHome: category.highlightedHome === true
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '', isActive: true, highlightedHome: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      return toast.error('Please upload a category image');
    }
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        // Generate slug from name if not provided (backend handles it usually but good to be safe)
        const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        await adminAPI.createCategory({ ...formData, slug });
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This may affect products in this category.')) {
      try {
        await adminAPI.deleteCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Categories</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage your product categories and structure.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5 text-white focus:border-blue-500/50' : 'bg-white border border-slate-200 text-slate-900 focus:border-blue-500/50 shadow-sm'}`}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 bg-[#0d6efd] hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className={`h-48 rounded-[2rem] animate-pulse ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
          ))
        ) : filteredCategories.map((category) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={category._id}
            className={`group rounded-[2.5rem] p-8 border transition-all duration-500 overflow-hidden relative ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500/30'}`}
          >
            {category.image && (
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <img src={category.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all overflow-hidden ${theme === 'Dark' ? 'bg-white/5 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaLayerGroup size={24} />
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(category)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <FaEdit size={14} />
                </button>
                <button onClick={() => handleDelete(category._id)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{category.name}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">120 Products</p>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${category.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {category.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                {category.isActive !== false ? (
                  <FaCheckCircle className="text-green-500" size={14} />
                ) : (
                  <FaTimes className="text-red-500" size={14} />
                )}
              </div>
            </div>
          </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Redesign */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5' : 'bg-white'}`}
            >
              <div className={`p-8 border-b flex justify-between items-center ${theme === 'Dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <h3 className={`text-xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Fill in the information below</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'Dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Phone Screens" 
                    className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category Image</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${formData.image ? 'border-blue-500/50 bg-blue-500/5' : theme === 'Dark' ? 'border-white/10 hover:border-white/20 bg-white/5' : 'border-slate-200 hover:border-blue-500/30 bg-slate-50'}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <FaCloudUploadAlt size={24} className={formData.image ? 'text-blue-500' : 'text-slate-400'} />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{formData.image ? 'Change Image' : 'Upload Image'}</p>
                    </div>
                    {formData.image && (
                      <div className="relative h-32 rounded-2xl overflow-hidden group">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, image: ''})}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    rows="4" 
                    placeholder="Describe the category..." 
                    className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all resize-none ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} 
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 py-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${formData.isActive ? 'bg-[#0d6efd]' : theme === 'Dark' ? 'bg-white/5' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}`}>Category is Active</span>
                  </div>

                  <div className="flex items-center gap-3 py-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, highlightedHome: !formData.highlightedHome })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${formData.highlightedHome ? 'bg-orange-500' : theme === 'Dark' ? 'bg-white/5' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${formData.highlightedHome ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}`}>Highlight on Home Page</span>
                  </div>
                </div>

                <div className={`mt-10 pt-8 border-t flex justify-end gap-4 ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                  <button type="submit" className="px-10 py-3.5 bg-[#0d6efd] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                    {editingCategory ? 'Save Changes' : 'Create Category'}
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

export default CategoryManagement;
