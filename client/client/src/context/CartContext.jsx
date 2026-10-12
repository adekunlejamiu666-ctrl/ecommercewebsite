import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  // Add item or increment quantity if already present
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.id || item._id) === (product.id || product._id)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id || product._id,
            name: product.name,
            price: Number(product.price) || 0,
            oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
            image: product.image || (product.images && product.images[0]) || "",
            category: product.category?.name || product.category || "",
            stock: product.stock ?? 99,
            quantity: quantity,
          },
        ];
      }
    });
  };

  // Remove specific item
  const removeFromCart = (productId) => {
    setCartItems((prev) =>
      prev.filter((item) => (item.id || item._id) !== productId)
    );
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if ((item.id || item._id) === productId) {
          const maxStock = item.stock || 99;
          return {
            ...item,
            quantity: Math.min(newQuantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  // Empty cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  // Free shipping threshold over ₦100, otherwise flat rate (or ₦0 if empty)
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;

  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
