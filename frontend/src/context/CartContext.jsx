import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api.js';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('dodos_token');
    if (token) fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      setCart(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, requestedQuantity = 1) => {
    const token = localStorage.getItem('dodos_token');
    if (!token) {
      toast.info('Please sign in to add items to your cart');
      window.location.href = '/login';
      return false;
    }

    const productId = product._id || product.id;
    const existingItem = cart.find(item =>
      (item.product?._id || item.product?.id || item._id) === productId
    );
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + requestedQuantity > product.stock) {
      toast.error(`❌ Only ${product.stock} items available in stock.`);
      return false;
    }

    try {
      const res = await cartAPI.addToCart({ productId, quantity: requestedQuantity });
      setCart(res.data.items || []);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (id) => {
    try {
      const res = await cartAPI.removeFromCart(id);
      setCart(res.data.items || []);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  const updateQuantity = async (id, quantity, productStock) => {
    if (quantity > productStock) {
      toast.error(`❌ Only ${productStock} items available.`);
      return;
    }
    try {
      if (quantity <= 0) {
        const res = await cartAPI.removeFromCart(id);
        setCart(res.data.items || []);
      } else {
        const res = await cartAPI.updateCartItem(id, { quantity });
        setCart(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = item.product || item;
    return sum + (product.price || 0) * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      clearCart, totalItems, totalPrice, loading, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
