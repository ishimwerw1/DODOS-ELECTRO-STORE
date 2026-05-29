import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaCloudUploadAlt, FaBoxOpen, FaLayerGroup, FaTags, FaDollarSign, FaFilter } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductManagement = () => {
  const { formatPrice } = useLocale();
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    category: '',
    subcategory: '',
    compatible: '',
    image: '',
    images: [],
    stock: '',
    description: ''
  });

  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await productAPI.getCategories();
      const catList = Array.isArray(res.data) ? res.data : [];
      setDbCategories(catList);
      if (catList.length > 0 && !formData.category) {
        const firstCat = catList[0];
        setFormData(prev => ({ ...prev, category: firstCat.name || firstCat }));
        setSubcategoryOptions(firstCat.subcategories || []);
      }
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  // When category changes, update subcategory options
  const handleCategoryChange = (catName) => {
    const cat = dbCategories.find(c => (c.name || c) === catName);
    setSubcategoryOptions(cat?.subcategories || []);
    setFormData(prev => ({ ...prev, category: catName, subcategory: '' }));
  };

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getProducts();
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 20 * 1024 * 1024) { // 20MB for 4K quality
          toast.error(`${file.name} is too large. Max size is 20MB for HD quality.`);
          return false;
        }
        return true;
      });

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage = reader.result;
          setFormData(prev => ({
            ...prev,
            image: prev.image || newImage,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: index === 0 ? (newImages[0] || '') : prev.image
      };
    });
  };

  const setMainImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image: prev.images[index]
    }));
    toast.info('Main image updated');
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      const cat = dbCategories.find(c => (c.name || c) === product.category);
      setSubcategoryOptions(cat?.subcategories || []);
      setFormData({
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory || '',
        compatible: product.compatible,
        image: product.image,
        images: product.images || [product.image],
        stock: product.stock,
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      const firstCat = dbCategories[0];
      setSubcategoryOptions(firstCat?.subcategories || []);
      setFormData({
        name: '',
        price: '',
        brand: brands[0],
        category: firstCat?.name || firstCat || '',
        subcategory: '',
        compatible: '',
        image: '',
        images: [],
        stock: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const brands = ['iPhone', 'Samsung', 'Tecno', 'Infinix', 'Xiaomi', 'Huawei', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, formData);
        toast.success('✅ Product updated successfully');
      } else {
        await productAPI.createProduct(formData);
        toast.success('✅ Product added successfully');
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
      setProductToDelete(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Products</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage your store products and inventory.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5 text-white focus:border-blue-500/50' : 'bg-white border border-slate-200 text-slate-900 focus:border-blue-500/50 shadow-sm'}`}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 bg-[#0d6efd] hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Product Info</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Price</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Stock</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'Dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-black truncate ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.brand} • {p.compatible}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${theme === 'Dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className={`p-6 text-sm font-black ${theme === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>{formatPrice(p.price)}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                      <span className={`text-xs font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{p.stock} pcs</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {p.stock > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(p)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => setProductToDelete(p)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              className={`relative w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5' : 'bg-white'}`}
            >
              <div className={`p-8 border-b flex justify-between items-center ${theme === 'Dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <h3 className={`text-xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Fill in the information below</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'Dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  {/* Left Column: Image Upload */}
                  <div className="md:col-span-5 space-y-6">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Product Images</label>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center overflow-hidden group transition-all ${theme === 'Dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button type="button" onClick={() => setMainImage(index)} className={`p-2 rounded-lg text-white ${formData.image === img ? 'bg-green-500' : 'bg-blue-500'}`}>
                              <FaImage size={12} />
                            </button>
                            <button type="button" onClick={() => removeImage(index)} className="p-2 bg-red-500 rounded-lg text-white">
                              <FaTrash size={12} />
                            </button>
                          </div>
                          {formData.image === img && <div className="absolute top-2 left-2 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Main</div>}
                        </div>
                      ))}
                      <label className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${theme === 'Dark' ? 'border-white/10 hover:border-blue-500/50 hover:bg-white/5 text-slate-500' : 'border-slate-200 hover:border-blue-500/50 hover:bg-slate-50 text-slate-400'}`}>
                        <FaPlus size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Add View</span>
                        <input type="file" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Fields */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="iPhone 14 Pro Screen" className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                          <select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value)} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all appearance-none ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required>
                            {dbCategories.map(c => <option key={c.name || c} value={c.name || c}>{c.name || c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subcategory</label>
                          <select value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all appearance-none ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`}>
                            <option value="">— None —</option>
                            {subcategoryOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brand</label>
                          <select value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all appearance-none ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price (RWF)</label>
                          <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="99.99" className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Count</label>
                          <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="50" className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Compatibility (Models)</label>
                        <input type="text" value={formData.compatible} onChange={(e) => setFormData({...formData, compatible: e.target.value})} placeholder="e.g. iPhone 13, iPhone 14" className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="4" placeholder="Describe the product details..." className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all resize-none ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-10 pt-8 border-t flex justify-end gap-4 ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                  <button type="submit" disabled={loading} className="px-10 py-3.5 bg-[#0d6efd] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductToDelete(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-md rounded-[2.5rem] p-8 overflow-hidden shadow-2xl ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5' : 'bg-white'}`}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                  <FaTrash size={32} />
                </div>
                <h3 className={`text-xl font-black tracking-tight mb-2 ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Delete Product?</h3>
                <p className="text-sm text-slate-500 font-medium mb-8">Are you sure you want to delete <span className="text-[#0d6efd] font-bold">"{productToDelete.name}"</span>? This action cannot be undone.</p>
                <div className="flex gap-4">
                  <button onClick={() => setProductToDelete(null)} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                  <button onClick={() => handleDelete(productToDelete._id)} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all active:scale-95">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;
