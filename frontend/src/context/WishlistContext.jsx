import { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../services/api.js';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('dodos_token');
    if (token) fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      setWishlist(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  const addToWishlist = async (product) => {
    const token = localStorage.getItem('dodos_token');
    if (!token) {
      toast.info('Please sign in to save items to your wishlist');
      window.location.href = '/login';
      return false;
    }
    try {
      const res = await wishlistAPI.addToWishlist({ productId: product._id || product.id });
      setWishlist(res.data.products || []);
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      return false;
    }
  };

  const removeFromWishlist = async (id) => {
    const token = localStorage.getItem('dodos_token');
    if (!token) {
      toast.info('Please sign in first');
      window.location.href = '/login';
      return;
    }
    try {
      const res = await wishlistAPI.removeFromWishlist(id);
      setWishlist(res.data.products || []);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const isInWishlist = (id) => wishlist.some(item => (item._id || item.id) === id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
