import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Lock } from 'lucide-react';
// 1. IMPORTAMOS TU IMAGEN LOCAL
import heroImage from './img/ppp.png';

/* ==========================================
   1. CONFIGURACIÓN FIREBASE E IMAGEN PRINCIPAL
   ========================================== */
const firebaseConfig = {
  apiKey: "AIzaSyBHRfE-N9r79J6VRDszBTtMfX4qbHEqCP8",
  authDomain: "mil-detalles-54182.firebaseapp.com",
  projectId: "mil-detalles-54182",
  storageBucket: "mil-detalles-54182.firebasestorage.app",
  messagingSenderId: "1089247315717",
  appId: "1:1089247315717:web:1e5e13ec77cc136d65596c"
};

const IMGBB_API_KEY = "bb39de761ad88a19dfa7965749dbcbb5";
const HERO_IMAGE = heroImage;

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) { console.warn("Firebase no conectado."); }

/* ==========================================
   2. CONTEXTOS (CARRITO Y NOTIFICACIONES)
   ========================================== */
const CartContext = createContext();
const ToastContext = createContext();

const AppProviders = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return showToast("⚠️ Este detalle está agotado.");
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast("✨ Agregado al carrito");
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen }}>
        {children}
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${toast ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
          <div className="bg-[#5C1A1F]/95 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-[#832729]">
            <span className="font-semibold text-sm tracking-wide font-poppins">{toast}</span>
          </div>
        </div>
      </CartContext.Provider>
    </ToastContext.Provider>
  );
};
const useCart = () => useContext(CartContext);
const useToast = () => useContext(ToastContext);

/* ==========================================
   3. ICONOS SVG PREMIUM
   ========================================== */
const IconGift = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg>;
const IconBag = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>;
const IconArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
const IconWhatsApp = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>;

/* ==========================================
   4. COMPONENTES DE INTERFAZ (UI)
   ========================================== */
const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  return (
    <nav className="bg-[#FAF8F5]/80 backdrop-blur-xl border-b border-[#EAE3D9] sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3 group">
          <div className="bg-[#832729] p-2.5 rounded-2xl shadow-lg shadow-[#832729]/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <div className="text-[#F2D5C4]"><IconGift /></div>
          </div>
          <span className="text-2xl font-playfair font-black text-[#4A3B32] tracking-wide">
            Mil<span className="text-[#832729] italic">Detalles</span>
          </span>
        </a>
        <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white hover:bg-[#F9EBE6] rounded-full text-[#4A3B32] hover:text-[#832729] transition-colors group border border-[#EAE3D9]">
          <IconBag />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#832729] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md shadow-[#832729]/40 group-hover:scale-110 transition-transform ring-2 ring-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-[#EAE3D9] mt-20 py-16">
    <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
      <div className="bg-[#832729] p-2 rounded-xl mb-4 text-[#F2D5C4]"><IconGift /></div>
      <h3 className="text-2xl font-playfair font-black text-[#4A3B32] tracking-wide mb-2">Mil Detalles</h3>
      <p className="text-[#8C7A6B] text-sm max-w-md mx-auto mb-6">El arte de regalar amor y momentos inolvidables. Hecho a mano, con dedicación para ti.</p>
      <p className="text-[#B09E8F] text-xs">© 2026 Mil Detalles. Todos los derechos reservados.</p>
    </div>
  </footer>
);

const CartSidebar = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerDetails, setCustomerDetails] = useState('');
  const { showToast } = useToast();

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    if (!customerName) return showToast(" Ingresa tu nombre para continuar");
    let msg = `Hola \nSoy ${customerName}.\nQuiero realizar este pedido:\n\n`;
    cart.forEach((item, i) => {
      msg += `▪️ *${item.name}* (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}\n`;
    });
    msg += `\n *Total estimado: $${totalPrice.toLocaleString()}*\n`;
    if (customerDetails) msg += `\n *Notas:* ${customerDetails}\n`;
    window.open(`https://wa.me/573177869158?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#4A3B32]/40 z-50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#FAF8F5] z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="px-6 py-5 bg-white flex justify-between items-center border-b border-[#EAE3D9]">
          <div className="flex items-center gap-3">
            <div className="bg-[#F9EBE6] p-2 rounded-full text-[#832729]"><IconBag /></div>
            <h2 className="text-2xl font-playfair font-black text-[#4A3B32] tracking-wide">Tu Compra</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="text-[#8C7A6B] hover:text-[#832729] hover:bg-[#F9EBE6] p-2 rounded-full transition-all">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {cart.length === 0 ? (
            <div className="text-center mt-24 text-[#B09E8F] flex flex-col items-center">
              <div className="bg-white p-6 rounded-full mb-4 opacity-70 border border-[#EAE3D9]"><IconBag /></div>
              <p className="font-semibold text-[#8C7A6B]">Tu carrito está vacío</p>
              <p className="text-sm mt-2">¡Anímate a agregar un detalle especial!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-3xl shadow-sm border border-[#EAE3D9] hover:shadow-md transition-shadow">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                <div className="flex-1 py-1">
                  <h4 className="font-bold text-[#4A3B32] text-sm leading-tight mb-1 line-clamp-2">{item.name}</h4>
                  <p className="text-[#832729] font-black text-sm mb-2">${item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-[#FAF8F5] text-[#8C7A6B] rounded-full hover:bg-[#F9EBE6] hover:text-[#832729] transition-colors border border-[#EAE3D9]">-</button>
                    <span className="text-sm font-bold text-[#4A3B32] w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-[#FAF8F5] text-[#8C7A6B] rounded-full hover:bg-[#F9EBE6] hover:text-[#832729] transition-colors border border-[#EAE3D9]">+</button>
                  </div>
                </div>
                <button onClick={() => { removeFromCart(item.id); showToast("Producto eliminado"); }} className="text-[#B09E8F] hover:text-[#832729] p-2 hover:bg-[#F9EBE6] rounded-full transition-colors mr-1"><IconTrash /></button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#EAE3D9] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] rounded-t-3xl relative -top-3">
            <div className="flex justify-between mb-5 items-end px-1">
              <span className="text-[#8C7A6B] font-bold text-sm">Total estimado</span>
              <span className="text-3xl font-black text-[#832729]">${totalPrice.toLocaleString()}</span>
            </div>
            <input type="text" placeholder="Tu Nombre completo" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full mb-3 p-3.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl focus:outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all text-sm font-medium text-[#4A3B32]" />
            <textarea placeholder="Notas (Ej: Dedicatoria, dirección...)" value={customerDetails} onChange={(e) => setCustomerDetails(e.target.value)} className="w-full mb-5 p-3.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl focus:outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all text-sm resize-none text-[#4A3B32]" rows="2" />

            <button onClick={handleWhatsAppCheckout} className="w-full bg-[#25D366] hover:bg-[#1EBE5C] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#25D366]/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
              <IconWhatsApp /> Pedir por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ==========================================
   5. VISTA DE DETALLE DE PRODUCTO
   ========================================== */
const ProductDetailView = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const isSoldOut = product.stock <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in zoom-in-95 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-[#8C7A6B] hover:text-[#832729] font-bold mb-8 transition-colors group bg-white px-4 py-2 rounded-full shadow-sm w-fit border border-[#EAE3D9]">
        <IconArrowLeft /> <span className="group-hover:-translate-x-1 transition-transform">Volver</span>
      </button>

      <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-10 md:gap-16 border border-[#EAE3D9]/50">
        <div className="w-full md:w-1/2">
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-[#FAF8F5] shadow-inner">
            <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${isSoldOut ? 'grayscale opacity-70' : ''}`} />
            <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-xs font-black text-[#4A3B32] uppercase tracking-widest shadow-lg shadow-black/5">
              {product.category}
            </div>
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#4A3B32]/20 backdrop-blur-[2px]">
                <span className="bg-[#5C1A1F] text-white font-black text-2xl px-6 py-2 rounded-xl uppercase tracking-widest rotate-[-10deg] shadow-2xl">
                  Agotado
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center py-6">
          <h1 className="text-4xl md:text-5xl font-playfair font-black text-[#4A3B32] mb-4 leading-tight tracking-wide">{product.name}</h1>
          <p className={`text-4xl font-black mb-8 ${isSoldOut ? 'text-[#8C7A6B]' : 'text-[#832729]'}`}>${product.price.toLocaleString()}</p>

          <div className="mb-10 bg-[#FAF8F5] p-6 rounded-3xl border border-[#EAE3D9]">
            <h3 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest mb-3">Descripción</h3>
            <p className="text-lg text-[#5D4E44] leading-relaxed font-medium whitespace-pre-line">{product.description || "Un detalle hermoso, preparado con amor."}</p>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={isSoldOut}
            className={`w-full font-bold py-5 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${isSoldOut
                ? 'bg-[#EAE3D9] text-[#8C7A6B] cursor-not-allowed shadow-none'
                : 'bg-[#832729] hover:bg-[#5C1A1F] text-white hover:shadow-[#832729]/30 transform hover:-translate-y-1'
              }`}>
            <IconBag /> {isSoldOut ? 'Agotado Temporalmente' : 'Agregar a mi compra'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   6. VISTA DE LA TIENDA (VITRINA AESTHETIC)
   ========================================== */
const StoreView = ({ products }) => {
  const { addToCart } = useCart();

  const [filter, setFilter] = useState('Arreglos');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['Arreglos', 'Peluches', 'Joyas'];

  const filteredProducts = products.filter(p => p.category === filter);
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.stock <= 0 && b.stock > 0) return 1;
    if (b.stock <= 0 && a.stock > 0) return -1;
    return 0;
  });

  if (selectedProduct) return <ProductDetailView product={selectedProduct} onBack={() => setSelectedProduct(null)} />;

  return (
    <div className="pb-20 bg-[#FAF8F5] min-h-screen">
      {/* HERO SECTION CON IMAGEN DE FONDO */}
      <div className="relative overflow-hidden mx-4 sm:mx-8 mt-6 rounded-[3rem] h-[400px] sm:h-[480px] flex items-center border border-[#EAE3D9] shadow-2xl shadow-[#CFA99A]/20">

        <img src={HERO_IMAGE} alt="Hero Mil Detalles" className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#F4DFD8]/95 via-[#F4DFD8]/70 to-transparent"></div>

        <div className="relative z-10 max-w-2xl px-10 sm:px-16">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-playfair font-black text-[#4A3B32] mb-4 leading-[1.1]">
            Detalles que <br /><span className="text-[#832729] italic">enamoran</span>
          </h1>
          <p className="text-lg md:text-xl text-[#5D4E44] font-medium max-w-md">Arreglos exclusivos y personalizados, diseñados para sorprender en el momento perfecto.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* FILTROS PILL */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-7 py-3 rounded-full text-sm font-bold transition-all duration-300 ${filter === cat
                  ? 'bg-[#832729] text-white shadow-lg shadow-[#832729]/30 scale-105'
                  : 'bg-white text-[#8C7A6B] shadow-sm border border-[#EAE3D9] hover:border-[#CFA99A] hover:text-[#832729] hover:bg-[#F9EBE6]'
                }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLA DE PRODUCTOS ESTILO BOUTIQUE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-[#8C7A6B]">
              Aún no hay productos en esta categoría.
            </div>
          ) : (
            sortedProducts.map(product => {
              const isSoldOut = product.stock <= 0;
              return (
                <div key={product.id} className={`bg-white rounded-[2rem] p-4 shadow-sm transition-all duration-500 border border-[#EAE3D9] flex flex-col h-full ${!isSoldOut && 'hover:shadow-[0_20px_50px_rgba(131,39,41,0.08)] hover:-translate-y-1 group'}`}>
                  <div onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                    <div className="relative overflow-hidden rounded-[1.5rem] aspect-[4/5] mb-5 bg-[#FAF8F5] shadow-inner">
                      <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${!isSoldOut && 'group-hover:scale-110'} ${isSoldOut ? 'grayscale opacity-70' : ''}`} />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-[#4A3B32] uppercase tracking-widest shadow-sm">{product.category}</div>

                      {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#4A3B32]/10 backdrop-blur-[1px]">
                          <span className="bg-[#5C1A1F] text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-widest rotate-[-5deg] shadow-lg">Agotado</span>
                        </div>
                      )}
                    </div>
                    <div className="px-2">
                      <h3 className={`font-bold text-lg leading-snug mb-1 transition-colors line-clamp-1 ${isSoldOut ? 'text-[#B09E8F]' : 'text-[#4A3B32] group-hover:text-[#832729]'}`}>{product.name}</h3>
                    </div>
                  </div>
                  <div className="px-2 mt-auto pt-4 flex items-center justify-between">
                    <span className={`text-2xl font-black ${isSoldOut ? 'text-[#B09E8F]' : 'text-[#832729]'}`}>${product.price.toLocaleString()}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      disabled={isSoldOut}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSoldOut
                          ? 'bg-[#EAE3D9] text-[#B09E8F] cursor-not-allowed'
                          : 'bg-[#832729] hover:bg-[#5C1A1F] text-white shadow-lg hover:shadow-[#832729]/40 hover:scale-105 active:scale-95'
                        }`}>
                      <IconBag />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   7. VISTA ADMIN
   ========================================== */
const AdminView = ({ products, fetchProducts }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Arreglos', price: '', stock: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const { showToast } = useToast();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#FAF8F5]">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,59,50,0.08)] max-w-md w-full text-center border border-[#EAE3D9]">
          <div className="flex justify-center text-[#832729] mb-4">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-playfair font-black text-[#4A3B32] mb-2 tracking-wide">Panel Admin</h2>
          <p className="text-[#8C7A6B] mb-8 text-sm font-medium">Gestión exclusiva del inventario.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña..."
            className="w-full p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl mb-6 text-center tracking-widest focus:outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all font-bold text-[#4A3B32]"
          />
          <button
            onClick={() => {
              if (password === 'mildetalles2026') setIsAuthenticated(true);
              else showToast("❌ Contraseña incorrecta");
            }}
            className="w-full bg-[#832729] hover:bg-[#5C1A1F] text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-[#832729]/30"
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, category: product.category, price: product.price.toString(), stock: product.stock.toString(), description: product.description || '' });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', category: 'Arreglos', price: '', stock: '', description: '' });
    setImageFile(null);
    if (document.getElementById('fileInput')) document.getElementById('fileInput').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return showToast("⚠️ Conecta Firebase primero");
    if (!editingId && !imageFile) return showToast("⚠️ Selecciona una foto");

    setIsUploading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const imgData = await imgRes.json();
        if (!imgData.success) throw new Error("Fallo en ImgBB");
        imageUrl = imgData.data.url;
      }

      const productData = { name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), description: form.description };
      if (imageUrl) productData.image = imageUrl;

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        showToast("✅ Cambios guardados");
      } else {
        await addDoc(collection(db, 'products'), productData);
        showToast("🚀 Producto publicado");
      }

      handleCancelEdit();
      fetchProducts();
    } catch (error) { showToast("❌ Error al guardar"); }
    setIsUploading(false);
  };

  const handleDelete = async (id) => {
    if (!db) return;
    if (window.confirm("¿Seguro que deseas eliminar permanentemente este detalle?")) {
      await deleteDoc(doc(db, 'products', id));
      showToast("🗑️ Producto eliminado");
      if (editingId === id) handleCancelEdit();
      fetchProducts();
    }
  };

  const sortedAdminProducts = [...products].sort((a, b) => {
    if (a.stock <= 0 && b.stock > 0) return 1;
    if (b.stock <= 0 && a.stock > 0) return -1;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 bg-[#FAF8F5] min-h-screen">
      <div className="mb-10 pb-6 border-b border-[#EAE3D9]">
        <h2 className="text-4xl font-playfair font-black text-[#4A3B32] tracking-wide mb-2">Inventario Maestro</h2>
        <p className="text-[#8C7A6B] font-medium">Control total de tu tienda. (Stock = 0 para marcar agotado).</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EAE3D9] xl:col-span-1 h-fit sticky top-28">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-black text-xl tracking-tight ${editingId ? 'text-[#832729]' : 'text-[#4A3B32]'}`}>
              {editingId ? 'Editando Detalle' : 'Crear Detalle'}
            </h3>
            {editingId && <button onClick={handleCancelEdit} className="text-xs font-bold text-[#8C7A6B] hover:text-[#832729] px-3 py-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded-full transition-colors">Cancelar</button>}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="w-full bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-2xl">
              <label className="block text-xs font-black text-[#8C7A6B] uppercase tracking-widest mb-3">{editingId ? 'Cambiar Foto (Opcional)' : 'Foto Obligatoria'}</label>
              <input id="fileInput" type="file" accept="image/*" required={!editingId} onChange={e => setImageFile(e.target.files[0])} className="w-full text-[#8C7A6B] file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white file:text-[#832729] file:shadow-sm hover:file:bg-[#F9EBE6] cursor-pointer text-sm font-medium" />
            </div>

            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl text-sm font-medium text-[#4A3B32] outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all" placeholder="Nombre completo del producto" />

            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl text-sm font-medium text-[#4A3B32] outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all">
              <option value="Arreglos">Arreglos</option>
              <option value="Peluches">Peluches</option>
              <option value="Joyas">Joyas</option>
            </select>

            <div className="flex gap-4">
              <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-1/2 p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl text-sm font-medium text-[#4A3B32] outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all" placeholder="Precio $" />
              <input type="number" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-1/2 p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl text-sm font-medium text-[#4A3B32] outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all" placeholder="Stock (0)" />
            </div>

            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl text-sm font-medium text-[#4A3B32] outline-none focus:border-[#CFA99A] focus:ring-4 focus:ring-[#F9EBE6] transition-all resize-none" placeholder="Escribe una descripción que enamore al cliente..." rows="4" />

            <button type="submit" disabled={isUploading} className={`mt-2 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg flex justify-center items-center gap-2 ${isUploading ? 'bg-[#B09E8F] cursor-not-allowed shadow-none' : (editingId ? 'bg-[#4A3B32] hover:bg-[#5D4E44]' : 'bg-[#832729] hover:bg-[#5C1A1F] hover:shadow-[#832729]/30 hover:-translate-y-1')}`}>
              {isUploading ? 'Procesando...' : (editingId ? 'Guardar Cambios' : 'Publicar en Tienda')}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-black text-xl text-[#4A3B32]">Catálogo Actual</h3>
            <span className="bg-white border border-[#EAE3D9] text-[#8C7A6B] text-xs font-bold px-3 py-1 rounded-full">{products.length} Items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAdminProducts.map(p => {
              const isSoldOut = p.stock <= 0;
              return (
                <div key={p.id} className={`bg-white p-4 rounded-3xl shadow-sm border ${editingId === p.id ? 'border-[#CFA99A] bg-[#F9EBE6]/30' : 'border-[#EAE3D9]'} flex gap-4 transition-all hover:shadow-md ${isSoldOut ? 'opacity-60 grayscale' : ''}`}>
                  <img src={p.image} alt={p.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                  <div className="flex-1 flex flex-col py-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest">{p.category}</span>
                      {isSoldOut && <span className="bg-[#4A3B32] text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Agotado</span>}
                    </div>
                    <h4 className="font-bold text-sm text-[#4A3B32] leading-tight mb-auto line-clamp-2">{p.name}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-[#832729]">${p.price.toLocaleString()}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditClick(p)} className="text-[#8C7A6B] hover:text-[#4A3B32] hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE3D9] p-2 rounded-xl transition-all" title="Editar"><IconEdit /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-[#8C7A6B] hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all" title="Eliminar"><IconTrash /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   8. APP MAIN
   ========================================== */
export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchProducts = async () => {
    if (!db) return;
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (error) { console.error("Error BD:", error); }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <AppProviders>
      {/* IMPORTACIÓN DE GOOGLE FONTS Y CLASES DE ESTILO */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
          
          .font-playfair { font-family: 'Playfair Display', serif; }
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}
      </style>

      <div className="min-h-screen bg-[#FAF8F5] font-poppins selection:bg-[#F9EBE6] selection:text-[#832729] flex flex-col">
        {currentRoute !== '#/admin' && <Navbar />}
        <CartSidebar />

        <main className="flex-1">
          {currentRoute === '#/admin' ? (
            <AdminView products={products} fetchProducts={fetchProducts} />
          ) : (
            <StoreView products={products} />
          )}
        </main>

        {currentRoute !== '#/admin' && <Footer />}
      </div>
    </AppProviders>
  );
}