"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiZap, FiCheckCircle, FiX, FiDatabase, FiTv, FiFilm } from "react-icons/fi";

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

export default function MigracaoSequencial() {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);
  const [migrando, setMigrando] = useState(false);
  const [modalStatus, setModalStatus] = useState({ show: false, title: "", message: "", type: "info" });

  useEffect(() => {
    async function fetchCats() {
      const snap = await getDocs(collection(db, "categorias"));
      setCategorias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchCats();
  }, []);

  const loadConteudo = async (catId) => {
    // Busca Filmes
    const snapF = await getDocs(collection(db, "categorias", catId, "filmes"));
    setFilmes(snapF.docs.map(d => ({ id: d.id, ...d.data() })));
    
    // Busca Séries (IMPORTANTE: Estava faltando carregar para o estado)
    const snapS = await getDocs(collection(db, "categorias", catId, "series"));
    setSeries(snapS.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (selectedCategoria) loadConteudo(selectedCategoria.id);
  }, [selectedCategoria]);

  const showStatus = (title, message, type = "success") => {
    setModalStatus({ show: true, title, message, type });
  };

  const executarMigracaoSequencial = async () => {
    if (!selectedCategoria) return;
    setMigrando(true);

    try {
      // --- MIGRAR FILMES (Série 1000) ---
      let contF = 1000;
      for (const item of filmes) {
        contF++;
        const novoId = `FILME-${contF}`;
        const dataFinal = { 
          ...item, 
          id: novoId, 
          id_referencia: novoId, 
          categoriaOrigin: selectedCategoria.id,
          tipo: 'filme'
        };

        await setDoc(doc(db, "categorias", selectedCategoria.id, "filmes", novoId), dataFinal);
        await setDoc(doc(db, "todos_os_conteudos", novoId), dataFinal);

        if (item.id !== novoId) {
          await deleteDoc(doc(db, "categorias", selectedCategoria.id, "filmes", item.id));
        }
      }

      // --- MIGRAR SÉRIES (Série 2000) ---
      let contS = 2000; 
      for (const item of series) {
        contS++;
        const novoId = `SERIE-${contS}`;
        const dataFinal = { 
          ...item, 
          id: novoId, 
          id_referencia: novoId, 
          categoriaOrigin: selectedCategoria.id,
          tipo: 'serie'
        };

        await setDoc(doc(db, "categorias", selectedCategoria.id, "series", novoId), dataFinal);
        await setDoc(doc(db, "todos_os_conteudos", novoId), dataFinal);

        if (item.id !== novoId) {
          await deleteDoc(doc(db, "categorias", selectedCategoria.id, "series", item.id));
        }
      }

      showStatus("Base Sincronizada!", `Os conteúdos de ${selectedCategoria.nome} foram movidos para a Coleção Global.`, "success");
      loadConteudo(selectedCategoria.id);
    } catch (e) {
      showStatus("Erro na Migração", e.message, "error");
    } finally {
      setMigrando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
            <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic">SkyCine <span className="text-red-600">Engine</span></h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Migração Global de Conteúdo</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase text-zinc-600">Status do Banco</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Conectado (v2.0)</p>
              </div>
              <FiDatabase className="text-zinc-800 text-4xl" />
            </div>
        </div>

        {/* Seletor de Categorias */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categorias.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSelectedCategoria(c)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all border ${selectedCategoria?.id === c.id ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/20'}`}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {selectedCategoria && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Botão Principal */}
            <button 
              onClick={executarMigracaoSequencial}
              disabled={migrando}
              className="w-full bg-white text-black hover:bg-red-600 hover:text-white disabled:bg-zinc-800 p-8 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-4 transition-all"
            >
              {migrando ? <FiRefreshCw className="animate-spin text-xl"/> : <FiZap className="text-xl"/>}
              {migrando ? "Processando e Mapeando..." : `Sincronizar ${selectedCategoria.nome} para Global`}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* LISTA DE FILMES */}
                <div className="bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                    <h3 className="text-[10px] font-black text-red-600 uppercase mb-6 tracking-widest flex items-center gap-2">
                      <FiFilm /> Filmes Detectados ({filmes.length})
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                        {filmes.map(f => (
                            <div key={f.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                <span className="text-[11px] font-bold truncate pr-4 italic uppercase">{f.titulo}</span>
                                <span className={`text-[9px] font-mono px-2 py-1 rounded ${f.id.includes('FILME-') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                  {f.id}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LISTA DE SÉRIES (ADICIONADA AGORA) */}
                <div className="bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase mb-6 tracking-widest flex items-center gap-2">
                      <FiTv /> Séries Detectadas ({series.length})
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                        {series.map(s => (
                            <div key={s.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                <span className="text-[11px] font-bold truncate pr-4 italic uppercase">{s.titulo}</span>
                                <span className={`text-[9px] font-mono px-2 py-1 rounded ${s.id.includes('SERIE-') ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                  {s.id}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL DE STATUS */}
      <AnimatePresence>
        {modalStatus.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl">
              {modalStatus.type === "success" ? <FiCheckCircle className="text-emerald-500 text-6xl mx-auto mb-6" /> : <FiX className="text-red-500 text-6xl mx-auto mb-6" />}
              <h2 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">{modalStatus.title}</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">{modalStatus.message}</p>
              <button onClick={() => setModalStatus({ ...modalStatus, show: false })} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:text-black transition-all">Fechar Protocolo</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}