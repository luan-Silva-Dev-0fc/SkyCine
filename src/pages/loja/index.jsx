"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; // Animações fluidas
import { Menu, X, Star, Rocket, LayoutGrid, ChevronRight } from "lucide-react"; // Ícones modernos

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  measurementId: "G-04C59E452Z"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function HackStore() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        apps: (doc.data().apps || []).map(app => ({
          ...app,
          appId: app.appId || app.id || `${doc.id}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const lastShown = localStorage.getItem("hackstore_notice_time");
    const now = Date.now();
    if (!lastShown || now - Number(lastShown) > 60 * 60 * 1000) {
      setTimeout(() => setShowModal(true), 1000); // Delay suave para o modal
      localStorage.setItem("hackstore_notice_time", now.toString());
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      {/* Background Dinâmico */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Navbar Minimalista */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-black/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu size={28} className="text-green-400" />
          </button>
          
          <div className="flex items-center gap-2 group cursor-default">
            <Rocket className="text-green-400 group-hover:animate-bounce" />
            <h1 className="text-2xl font-black tracking-tighter uppercase">
              Hack<span className="text-green-400">Store</span>
            </h1>
          </div>

          <div className="w-10 h-10 rounded-full border border-white/10 bg-gradient-to-tr from-green-500 to-blue-500 shadow-lg shadow-green-500/20" />
        </div>
      </nav>

      {/* Sidebar com Framer Motion */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-[#0a0a0a] border-r border-white/10 z-[70] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest text-sm">
                  <LayoutGrid size={18} /> Navegação
                </span>
                <button onClick={() => setMenuOpen(false)}><X size={24} /></button>
              </div>

              <div className="space-y-8">
                {categories.map((cat, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={cat.id}
                  >
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2 tracking-tighter">{cat.name}</h4>
                    <div className="space-y-1">
                      {cat.apps.map(app => (
                        <Link 
                          key={app.appId} href={`/aplicativos/${app.appId}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
                        >
                          <span className="text-sm font-medium">{app.name}</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-3xl bg-green-500/10 border border-green-500/20 mb-6"
          >
            <Rocket size={48} className="text-green-400" />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            O futuro do <span className="text-green-400 underline decoration-green-500/30 underline-offset-8">download</span>.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            Sua central de ferramentas avançadas e jogos premium. 
            Simples, rápido e totalmente otimizado.
          </p>
        </header>

        {/* Categorias e Grids */}
        <div className="space-y-24">
          {categories.map((category) => (
            <section key={category.id}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-green-500/50 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.apps.map((app, index) => (
                  <motion.div
                    whileHover={{ y: -8 }}
                    key={app.appId}
                    className="group relative bg-[#111] border border-white/5 rounded-[2rem] p-4 transition-all hover:border-green-500/30 hover:shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]"
                  >
                    <Link href={`/aplicativos/${app.appId}`}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-black">
                        <img
                          src={app.cover || "/covers/default.jpg"}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        />
                      </div>
                      <div className="px-2">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-green-400 transition-colors">
                            {app.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} size={12} 
                              className={i < (app.stars || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} 
                            />
                          ))}
                        </div>
                        <button className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all group-hover:bg-green-400 group-hover:scale-[1.02]">
                          Explorar
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Modal Moderno */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[2.5rem] max-w-sm text-center shadow-3xl"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-black mb-4">PRÓXIMO NÍVEL</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light">
                Estamos refinando sua experiência com novos módulos e integração ultra-rápida. 
                Prepare-se para o que vem por aí.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                VAMOS NESSA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}