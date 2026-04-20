import { useState, useMemo } from 'react';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Product, CartItem, Config } from '../types';

export const useCart = (config: Config) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) return prev;

        return prev.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, cartQuantity: Math.max(1, Math.min(quantity, item.stock)) };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const totals = useMemo(() => {
    let totalUsd = 0;

    cartItems.forEach(item => {
      const unitPriceCost = item.bulkCost / item.unitsPerBulk;
      const unitSalePriceUsd = unitPriceCost * (1 + item.profitMargin);

      const appliedDiscount = (item.discountThreshold && item.cartQuantity >= item.discountThreshold) 
        ? (item.discountRate || 0) 
        : 0;
        
      const finalUnitSalePrice = unitSalePriceUsd * (1 - appliedDiscount);

      totalUsd += finalUnitSalePrice * item.cartQuantity;
    });

    const totalBs = totalUsd * config.exchangeRate;

    return { totalUsd, totalBs };
  }, [cartItems, config.exchangeRate]);

  const finalizeSale = async () => {
    if (cartItems.length === 0) return;

    try {
      const batch = writeBatch(db);

      // Descontar inventario y aumentar popularidad por cada producto
      cartItems.forEach(item => {
        if (!item.id) return;
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          stock: increment(-item.cartQuantity),
          popularity: increment(item.cartQuantity)
        });
      });

      // Ejecutar todas las escrituras juntas
      await batch.commit();

      toast.success('¡Venta procesada con éxito!');
      clearCart();
    } catch (error) {
      console.error("Error al finalizar la venta:", error);
      toast.error('Hubo un error procesando la venta');
    }
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals,
    finalizeSale
  };
};
