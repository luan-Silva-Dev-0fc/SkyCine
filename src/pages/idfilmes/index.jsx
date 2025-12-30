"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiClock, FiStar, FiChevronLeft, FiInfo, FiActivity } from "react-icons/fi";

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

export default function PlayerFilme() {
  const router = useRouter();
  const { id } = router.query; // Aqui virá "FILME-1001"
  const videoRef = useRef(null);

  const [filme, setFilme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalRetomar, setModalRetomar] = useState(false);
  const [tempoSalvo, setTempoSalvo] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function carregarFilme() {
      setLoading(true);
      try {
        // 1. Pegamos todas as categorias para saber onde procurar
        const categoriasSnap = await getDocs(collection(db, "categorias"));
        let dadosEncontrados = null;

        // 2. Percorremos as categorias tentando dar um 'getDoc' direto no ID
        for (const catDoc of categoriasSnap.docs) {
          // O caminho exato: categorias -> ID_CATEGORIA -> filmes -> FILME-1001
          const docRef = doc(db, "categorias", catDoc.id, "filmes", String(id));
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            dadosEncontrados = { id: docSnap.id, ...docSnap.data() };
            break; // Achou o filme? Para o loop.
          }
        }

        if (dadosEncontrados) {
          setFilme(dadosEncontrados);
          // Verificar se tem tempo salvo no localStorage
          const saved = localStorage.getItem(`tempo-${id}`);
          if (saved && parseFloat(saved) > 10) {
            setTempoSalvo(parseFloat(saved));
            setModalRetomar(true);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar documento:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarFilme();
  }, [id]);

  const salvarTempo = () => {
    if (videoRef.current && id) {
      localStorage.setItem(`tempo-${id}`, videoRef.current.currentTime.toString());
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-white font-black text-[10px] tracking-widest uppercase animate-pulse">Iniciando Protocolo {id}</p>
    </div>
  );

  if (!filme) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-center">
      <p className="text-zinc-600 font-black uppercase text-xs mb-4 italic">Conteúdo {id} não localizado na SkyNet</p>
      <button onClick={() => router.back()} className="text-red-600 font-black uppercase text-[10px] border-b border-red-600">Voltar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background desfoque */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-3xl scale-110" style={{ backgroundImage: `url(${filme.capa})` }} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <AnimatePresence>
        {modalRetomar && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-zinc-900 p-10 rounded-[2.5rem] border border-white/5 text-center max-w-sm">
              <FiClock className="text-red-600 text-4xl mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase italic mb-6">Retomar de onde parou?</h2>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { videoRef.current.currentTime = tempoSalvo; videoRef.current.play(); setModalRetomar(false); }}
                  className="bg-red-600 py-4 rounded-2xl font-black uppercase text-[10px]"
                >
                  Sim, Continuar
                </button>
                <button onClick={() => setModalRetomar(false)} className="text-zinc-500 py-2 font-black uppercase text-[10px]">Recomeçar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
          <FiChevronLeft /> Sair do Player
        </button>

        <div className="grid gap-10">
          <div className="space-y-4">
             <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">{filme.titulo}</h1>
             <div className="flex gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1 text-white"><FiStar className="text-yellow-500 fill-yellow-500"/> {filme.estrelas || "5.0"}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-zinc-300">{filme.id_referencia || id}</span>
             </div>
          </div>

          <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <video 
              ref={videoRef} 
              src={filme.video} 
              controls 
              autoPlay 
              onPause={salvarTempo}
              className="w-full h-full"
            />
          </div>

          <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 max-w-3xl">
             <h3 className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><FiInfo /> Resumo</h3>
             <p className="text-zinc-400 text-lg font-medium italic leading-relaxed">
               {filme.descricao || "Nenhuma descrição disponível para este título."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}