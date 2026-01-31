"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiMenu, FiMessageCircle, FiX, FiPlus, FiShield, FiCheck } from "react-icons/fi";

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
  const [showMenu, setShowMenu] = useState(false);
  const [showAviso, setShowAviso] = useState(true); // Controle do Modal de Aviso
  
  const [search, setSearch] = useState("");
  const [filmesApi, setFilmesApi] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [loadingMais, setLoadingMais] = useState(false);
  const [temMais, setTemMais] = useState(true);
  
  const apiKey = '20512dd4';

  useEffect(() => {
    // Verificar se o usuário já aceitou o aviso nesta sessão
    const aceitou = sessionStorage.getItem("skycine_aviso");
    if (aceitou) setShowAviso(false);

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

  const aceitarAviso = () => {
    sessionStorage.setItem("skycine_aviso", "true");
    setShowAviso(false);
  };

  const fetchMovies = async (resetar = false) => {
    const novaPagina = resetar ? 1 : pagina;
    const termoBusca = search.length >= 3 ? search : "2025"; 
    
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

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#050505] text-white font-sans ${showAviso ? 'overflow-hidden' : ''}`}>
      
      {/* 1. MODAL DE AVISO ÉTICO MODERNO */}
      <AnimatePresence>
        {showAviso && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative bg-zinc-900/50 border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-xl w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-600/30">
                <FiShield size={40} className="text-red-600" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Termos de Uso <span className="text-red-600">SkyCine</span></h2>
              <div className="space-y-4 text-zinc-400 text-sm leading-relaxed mb-10">
                <p>Este é um projeto voltado exclusivamente para <strong>treinamento tecnológico, ética digital e propósitos educacionais</strong>.</p>
                <p>Informamos que o SkyCine utiliza a OMDb API para exibição de metadados e posters. <strong>Não fornecemos links para filmes completos</strong>, respeitando integralmente as leis de direitos autorais.</p>
              </div>
              <button 
                onClick={aceitarAviso}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <FiCheck size={20} /> Entrar na Plataforma
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. NAVBAR FIXA MODERNA */}
      <nav className="fixed top-0 w-full z-[100] transition-all bg-black/40 backdrop-blur-md border-b border-white/5 px-6 py-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase pointer-events-none">
              Sky<span className="text-red-600 text-4xl leading-[0]">.</span>Cine
            </h1>
            <button onClick={() => setShowMenu(true)} className="flex items-center gap-2 group">
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-red-600 transition-colors">
                <FiMenu size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Explorar</span>
            </button>
          </div>

          <div className="flex-1 max-w-lg mx-12 relative hidden md:block">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisa Global OMDb..."
              className="w-full bg-white/5 border border-white/5 pl-12 pr-4 py-3 rounded-2xl outline-none focus:bg-white/10 focus:border-red-600/50 transition-all text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {perfil && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-zinc-500 uppercase">Bem-vindo</p>
                <p className="text-[11px] font-black uppercase tracking-tighter">{perfil.nome}</p>
              </div>
              <img src={perfil.avatar} className="w-10 h-10 rounded-2xl border-2 border-red-600 object-cover shadow-lg shadow-red-600/20" alt="avatar" />
            </div>
          )}
        </div>
      </nav>

      {/* 3. CONTEÚDO */}
      <main className="pt-40 px-6 md:px-16 pb-32 max-w-[1800px] mx-auto">
        
        {/* Header Dinâmico */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <div className="w-8 h-[2px] bg-red-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">SkyCine Library</span>
            </div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">
              {search ? search : "Coleção Infinita"}
            </h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full md:max-w-md pb-2">
            {categorias.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSearch(cat.nome)}
                className="whitespace-nowrap px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all"
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Profissional */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
          {filmesApi.map((movie, index) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={`${movie.imdbID}-${index}`}
              className="group cursor-pointer"
              onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`, "_blank")}
            >
              <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-red-600 group-hover:shadow-[0_0_40px_rgba(229,9,20,0.2)]">
                <img 
                  src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/400x600?text=SkyCine"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt={movie.Title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-6">
                   <span className="text-red-600 text-[10px] font-black mb-1 uppercase tracking-widest">OMDb Data</span>
                   <div className="bg-white text-black py-3 rounded-2xl text-center font-black text-[9px] uppercase tracking-widest">Consultar API</div>
                </div>
              </div>
              <h4 className="mt-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white truncate">{movie.Title}</h4>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1 h-1 bg-red-600 rounded-full" />
                 <p className="text-zinc-600 text-[9px] font-bold">{movie.Year} • {movie.Type}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {temMais && (
          <div className="mt-24 flex justify-center">
            <button
              onClick={() => fetchMovies()}
              disabled={loadingMais}
              className="group relative bg-white text-black px-16 py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] overflow-hidden transition-all hover:pr-20 active:scale-95"
            >
              <span className="relative z-10">{loadingMais ? "Buscando..." : "Explorar mais filmes"}</span>
              <div className="absolute inset-y-0 right-8 flex items-center opacity-0 group-hover:opacity-100 transition-all">
                 <FiPlus size={20} />
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Menu Firebase */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMenu(false)} className="fixed inset-0 bg-black/95 z-[150] backdrop-blur-xl" />
            <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="fixed top-0 left-0 h-full w-80 bg-zinc-900 z-[160] p-12 border-r border-white/5">
              <div className="flex justify-between items-center mb-20">
                <h2 className="text-3xl font-black italic tracking-tighter">Sky<span className="text-red-600">Cine</span></h2>
                <button onClick={() => setShowMenu(false)} className="hover:text-red-600 transition-colors"><FiX size={24} /></button>
              </div>
              <ul className="space-y-8">
                {categorias.map(cat => (
                  <li key={cat.id} onClick={() => { setSearch(cat.nome); setShowMenu(false); }} className="text-zinc-500 hover:text-white font-black uppercase tracking-widest cursor-pointer text-sm transition-all flex items-center gap-3">
                    <span className="w-2 h-[2px] bg-red-600" />
                    {cat.nome}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #ff0000; }
        body { background-color: #050505; cursor: default; }
      `}</style>
    </div>
  );
}