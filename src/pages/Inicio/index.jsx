"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiMenu, FiMessageCircle, FiPlay, FiX, FiPlus, FiAlertCircle } from "react-icons/fi";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // ESTADOS DA API
  const [search, setSearch] = useState("");
  const [filmesApi, setFilmesApi] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [loadingMais, setLoadingMais] = useState(false);
  const [temMais, setTemMais] = useState(true);
  
  const apiKey = '20512dd4';

  useEffect(() => {
    const fetchFirebase = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categorias"));
        setCategorias(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const auth = getAuth(app);
        if (auth.currentUser) {
          const pSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (pSnap.exists()) setPerfil(pSnap.data());
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFirebase();
  }, []);

  const fetchMovies = async (resetar = false) => {
    const novaPagina = resetar ? 1 : pagina;
    const termoBusca = search.length >= 3 ? search : "action"; 
    
    setLoadingMais(true);
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${termoBusca}&page=${novaPagina}&apikey=${apiKey}`);
      const data = await res.json();
      
      if (data.Response === "True") {
        setFilmesApi(prev => resetar ? data.Search : [...prev, ...data.Search]);
        setTemMais(true);
        setPagina(novaPagina + 1);
      } else {
        if (resetar) setFilmesApi([]);
        setTemMais(false);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingMais(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchMovies(true), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600">
      
      {/* AVISO ÉTICO FIXO */}
      <div className="bg-red-600/10 border-b border-red-600/20 py-2 px-4 flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold text-red-500 text-center">
        <FiAlertCircle className="flex-shrink-0" />
        PROJETO EDUCACIONAL: Este site é voltado para treinamento e ética. Não hospedamos filmes completos por respeito aos direitos autorais.
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all px-6 py-4 flex flex-col gap-4 ${scrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"} mt-10 md:mt-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setShowMenu(true)} className="p-2 hover:bg-white/10 rounded-full transition-all text-red-600"><FiMenu size={24} /></button>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Sky<span className="text-red-600">Cine</span></h1>
          </div>

          <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar no catálogo infinito da OMDb..."
              className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-red-600 transition-all text-sm focus:bg-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {perfil && (
            <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full pr-4 border border-white/5">
              <img src={perfil.avatar || "https://via.placeholder.com/150"} className="w-8 h-8 rounded-full border-2 border-red-600 object-cover" alt="avatar" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{perfil.nome}</span>
            </div>
          )}
        </div>

        {/* BARRA DE CATEGORIAS DINÂMICAS (Firebase) */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSearch(cat.nome)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition-all"
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      <main className="pt-52 px-6 md:px-16 pb-32">
        <div className="flex items-center justify-between mb-12">
          <div className="flex flex-col">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              {search ? search : "Infinite Library"}
            </h2>
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-[0.4em] mt-2 ml-1">Streaming Experience</span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/50 to-transparent mx-8 hidden sm:block" />
        </div>

        {/* Grid de Filmes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
          {filmesApi.map((movie, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index % 10) * 0.03 }}
              key={`${movie.imdbID}-${index}`}
              className="group relative"
              onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`, "_blank")}
            >
              <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all group-hover:border-red-600 group-hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]">
                <img 
                  src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/400x600?text=Poster+Not+Available"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={movie.Title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                   <p className="text-[8px] text-red-500 font-black mb-1">DETALHES</p>
                   <h5 className="text-[11px] font-black leading-tight uppercase mb-4">{movie.Title}</h5>
                   <div className="bg-red-600 text-white w-full py-2.5 rounded-lg text-center font-black text-[9px] uppercase tracking-widest shadow-xl">Informações</div>
                </div>
              </div>
              <div className="mt-4 px-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white truncate transition-colors">{movie.Title}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-red-600 text-[9px] font-bold">{movie.Year}</span>
                  <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase">{movie.Type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botão Carregar Mais */}
        {temMais && (
          <div className="mt-24 flex flex-col items-center gap-4">
            <button
              onClick={() => fetchMovies()}
              disabled={loadingMais}
              className="relative overflow-hidden group bg-white text-black px-16 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all hover:bg-red-600 hover:text-white active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-3">
                {loadingMais ? "Sincronizando..." : "Expandir Universo"}
              </span>
            </button>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Página {pagina - 1} de ∞</p>
          </div>
        )}
      </main>

      {/* Menu Lateral Firebase */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMenu(false)} className="fixed inset-0 bg-black/95 z-[60] backdrop-blur-md" />
            <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="fixed top-0 left-0 h-full w-80 bg-[#080808] z-[70] p-10 border-r border-white/5">
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Sky<span className="text-red-600">Library</span></h2>
                <button onClick={() => setShowMenu(false)} className="text-zinc-500 hover:text-white"><FiX size={24} /></button>
              </div>
              <nav>
                <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-8">Navegação Local</p>
                <ul className="space-y-6">
                  {categorias.map(cat => (
                    <li 
                      key={cat.id} 
                      onClick={() => { setSearch(cat.nome); setShowMenu(false); }}
                      className="text-zinc-500 hover:text-white font-black uppercase tracking-widest cursor-pointer text-sm transition-all flex items-center gap-4 group"
                    >
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                      {cat.nome}
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E50914; border-radius: 10px; }
        body { background-color: #050505; }
      `}</style>
    </div>
  );
}