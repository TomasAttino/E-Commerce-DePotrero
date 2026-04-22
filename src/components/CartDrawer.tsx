"use client";

import { X, Trash2, Send } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, totalPrice, totalItems } = useCart();

  const handleWhatsAppOrder = () => {
    const phoneNumber = "5491123456789"; // Reemplazar con número real
    const message = cart.map(item => 
      `- ${item.name} (${item.quantity}x) | Talle: ${item.selectedSize} | Color: ${item.selectedColor}`
    ).join('\n');
    const total = `Total: $${totalPrice.toLocaleString('es-AR')}`;
    const encodedMessage = encodeURIComponent(`¡Hola! Me gustaría encargar:\n\n${message}\n\n${total}`);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-white/10">
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-tighter">Tu Carrito ({totalItems})</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 italic">
              El carrito está vacío
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                <div className="w-20 h-24 bg-zinc-900 flex-none overflow-hidden border border-white/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate text-white">{item.name}</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                    Talle: {item.selectedSize} | Color: {item.selectedColor}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-black text-white">${item.price.toLocaleString('es-AR')} <span className="text-xs text-zinc-500 font-normal">x {item.quantity}</span></p>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4 bg-zinc-900/50">
            <div className="flex items-center justify-between text-xl font-black text-white">
              <span>Total</span>
              <span>${totalPrice.toLocaleString('es-AR')}</span>
            </div>
            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <Send size={18} />
              Enviar Pedido vía WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
