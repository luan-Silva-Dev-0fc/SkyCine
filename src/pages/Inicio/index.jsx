"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiMenu, FiSettings, FiMessageCircle, FiPlay, FiX } from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Modal secreto e Perfil
  const [showModal, setShowModal] = useState(false);
  const [codigoAnimado, setCodigoAnimado] = useState("");
  const [perfil, setPerfil] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
    authDomain: "skycine-c59b0.firebaseapp.com",
    projectId: "skycine-c59b0",
    storageBucket: "skycine-c59b0.firebasestorage.app",
    messagingSenderId: "1084857538934",
    appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  };

  const app = useMemo(() => (getApps().length ? getApp() : initializeApp(firebaseConfig)), []);
  const db = useMemo(() => getFirestore(app), [app]);

  // Efeito de Scroll para a Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carregar Perfil do Usuário
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPerfil(snap.data());
          const lastWelcome = localStorage.getItem("lastWelcome");
          const now = Date.now();
          if (!lastWelcome || now - Number(lastWelcome) > 24 * 60 * 60 * 1000) {
            setShowWelcome(true);
            localStorage.setItem("lastWelcome", now.toString());
            setTimeout(() => setShowWelcome(false), 5000);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchPerfil();
  }, [db]);

  // Carregar Dados do Firestore
  const loadData = async () => {
    setLoading(true);
    try {
      const categoriasSnap = await getDocs(collection(db, "categorias"));
      const categoriasArray = categoriasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategorias(categoriasArray);

      const filmesArray = [];
      const seriesArray = [];

      for (const cat of categoriasArray) {
        const filmesSnap = await getDocs(collection(db, "categorias", cat.id, "filmes"));
        filmesSnap.forEach(f => {
          filmesArray.push({ id: f.id, categoriaId: cat.id, categoriaNome: cat.nome, ...f.data() });
        });
        const seriesSnap = await getDocs(collection(db, "categorias", cat.id, "series"));
        seriesSnap.forEach(s => {
          seriesArray.push({ id: s.id, categoriaId: cat.id, categoriaNome: cat.nome, ...s.data() });
        });
      }
      setFilmes(filmesArray);
      setSeries(seriesArray);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filme em Destaque Aleatório
  const filmeDestaque = useMemo(() => {
    if (!filmes.length) return null;
    return filmes[Math.floor(Math.random() * filmes.length)];
  }, [filmes]);

  // Gesto secreto (Swipe Right para Loja)
  useEffect(() => {
    let startX = null;
    const touchStart = (e) => startX = e.touches[0].clientX;
    const touchMove = (e) => {
      if (startX === null) return;
      const deltaX = e.touches[0].clientX - startX;
      if (deltaX > 150 && !showModal) {
        setShowModal(true);
        const linhas = ["Iniciando Protocolo...", "Bypass de Segurança...", "Portal da Loja Aberto!"];
        let i = 0;
        const int = setInterval(() => {
          setCodigoAnimado(linhas[i]); i++;
          if (i >= linhas.length) { clearInterval(int); router.push("/loja"); }
        }, 800);
      }
    };
    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchmove", touchMove);
    return () => { window.removeEventListener("touchstart", touchStart); window.removeEventListener("touchmove", touchMove); };
  }, [router, showModal]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h1 className="text-white font-black tracking-[0.3em] uppercase animate-pulse">SkyCine</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans selection:bg-red-600 overflow-x-hidden">
      
      {/* Navbar Dinâmica */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 flex items-center justify-between ${scrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"}`}>
        <div className="flex items-center gap-6">
          <button onClick={() => setShowMenu(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <FiMenu size={24} />
          </button>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            Sky<span className="text-red-600">Cine</span>
          </h1>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
           <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
           <input 
             type="text" 
             placeholder="O que você quer assistir?" 
             className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-2.5 rounded-2xl focus:bg-white/10 focus:border-red-600/50 transition-all outline-none text-sm"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>

        <div className="flex items-center gap-4">
          {perfil && (
            <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full border-2 border-red-600 overflow-hidden shadow-lg">
                <img src={perfil.avatar || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="avatar" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{perfil.nome}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section (Destaque) */}
      {filmeDestaque && (
        <section className="relative w-full h-[80vh] flex items-end pb-24 px-6 md:px-16 overflow-hidden">
          <video 
            src={filmeDestaque.video} autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-transparent to-transparent" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-600 text-[9px] font-black uppercase px-2 py-1 rounded-sm tracking-[0.2em]">Original</span>
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest underline decoration-red-600">Em Alta</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black uppercase italic mb-8 leading-none tracking-tighter drop-shadow-2xl">{filmeDestaque.titulo}</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push(`/idfilmes?id=${filmeDestaque.id}`)}
                className="bg-white text-black px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase text-xs tracking-widest"
              >
                <FiPlay fill="currentColor" size={18} /> Assistir Agora
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Mensagem de Boas-vindas Dinâmica */}
      <AnimatePresence>
        {showWelcome && perfil && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            className="fixed top-24 right-6 z-[60] bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-black">!</div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Bem-vindo de volta</p>
              <h4 className="text-sm font-black text-white">{perfil.nome}</h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listagem de Categorias e Filmes */}
      <main className="relative z-20 -mt-16 pb-32 space-y-16">
        {categorias.map(cat => {
          const itensFiltrados = [
            ...filmes.filter(f => f.categoriaId === cat.id && f.titulo.toLowerCase().includes(search.toLowerCase())),
            ...series.filter(s => s.categoriaId === cat.id && s.titulo.toLowerCase().includes(search.toLowerCase()))
          ];

          if (itensFiltrados.length === 0) return null;

          return (
            <section key={cat.id} className="px-6 md:px-16 animate-in fade-in duration-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                  {cat.nome}<span className="text-red-600">.</span>
                </h3>
                <div className="h-[1px] flex-1 bg-white/5 mx-6 hidden sm:block" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                {itensFiltrados.map(item => (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    key={item.id} 
                    className="group cursor-pointer"
                    onClick={() => router.push(item.capitulos ? `/idseries?id=${item.id}` : `/idfilmes?id=${item.id}`)}
                  >
                    <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-xl transition-all group-hover:shadow-red-600/20 group-hover:border-red-600/30">
                      <img 
                        src={item.capa} 
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                        alt={item.titulo}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                         <div className="w-full bg-white text-black py-3 rounded-xl text-center font-black text-[10px] uppercase tracking-widest shadow-2xl">
                            {item.capitulos ? "Ver Temporadas" : "Reproduzir"}
                         </div>
                      </div>
                    </div>
                    <p className="mt-4 text-xs font-black text-zinc-500 group-hover:text-white transition uppercase tracking-widest truncate">
                      {item.titulo}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* BOTÃO SKYCHAT - Encaminha para /chat */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/chat")}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-white text-black rounded-3xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:bg-zinc-100 transition-all border border-white/20 group"
      >
        <div className="relative">
          <FiMessageCircle size={26} className="group-hover:text-red-600 transition-colors" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden sm:block">
          SkyChat
        </span>
      </motion.button>

      {/* Menu Lateral Estilizado */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }}
              className="fixed top-0 left-0 h-full w-80 bg-[#0c0c0c] z-[70] p-10 border-r border-white/5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Sky<span className="text-red-600">Menu</span></h2>
                <button onClick={() => setShowMenu(false)}><FiX size={24} /></button>
              </div>
              <ul className="space-y-8">
                {categorias.map(cat => (
                  <li key={cat.id} 
                    onClick={() => { setShowMenu(false); /* Adicione scroll para categoria aqui se desejar */ }}
                    className="text-zinc-500 hover:text-white text-lg font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-4 group"
                  >
                    <span className="w-0 group-hover:w-4 h-[2px] bg-red-600 transition-all rounded-full" />
                    {cat.nome}
                  </li>
                ))}
              </ul>
              <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4">
                <button 
                   onClick={() => router.push("/configuracoes")}
                   className="w-full flex items-center justify-center gap-3 bg-white/5 py-4 rounded-2xl hover:bg-white/10 transition text-[10px] font-black uppercase tracking-widest border border-white/5"
                >
                  <FiSettings size={18} /> Configurações
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Secreto (Loja) */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/98 flex items-center justify-center z-[100] p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111] border border-emerald-500/20 p-12 rounded-[3rem] w-full max-w-sm text-center font-mono shadow-2xl">
              <div className="w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin mx-auto mb-8" />
              <p className="text-emerald-500 text-[10px] mb-4 uppercase tracking-[0.5em] font-black">Acessando Camada Oculta</p>
              <p className="text-white text-sm font-bold opacity-80">{codigoAnimado}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #070707; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #E50914; }
        body { background-color: #070707; }
      `}</style>
    </div>
  );
}