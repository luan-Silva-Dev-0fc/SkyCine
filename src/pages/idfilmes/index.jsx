"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiStar, FiInfo, FiClock, FiAlertCircle } from "react-icons/fi";
import Hls from "hls.js";

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
  const { id } = router.query;
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [filme, setFilme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalRetomar, setModalRetomar] = useState(false);
  const [tempoSalvo, setTempoSalvo] = useState(0);
  const [perfil, setPerfil] = useState(null);
  const [errorStatus, setErrorStatus] = useState(false);

  // 1. CARREGAR PERFIL
  useEffect(() => {
    const fetchPerfil = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setPerfil(snap.data());
    };
    fetchPerfil();
  }, []);

  // 2. BUSCA PARALELA DE DADOS
  useEffect(() => {
    if (!id) return;
    async function carregarFilme() {
      setLoading(true);
      setErrorStatus(false);
      try {
        const categoriasSnap = await getDocs(collection(db, "categorias"));
        const categoriasArray = categoriasSnap.docs.map(d => ({ id: d.id }));
        
        const promessas = categoriasArray.map(async (cat) => {
          const docRef = doc(db, "categorias", cat.id, "filmes", String(id));
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });

        const resultados = await Promise.all(promessas);
        const dadosEncontrados = resultados.find(r => r !== null);

        if (dadosEncontrados) {
          setFilme(dadosEncontrados);
          const saved = localStorage.getItem(`tempo-${id}`);
          if (saved && parseFloat(saved) > 15) {
            setTempoSalvo(parseFloat(saved));
            setModalRetomar(true);
          }
        }
      } catch (err) {
        console.error("Erro SkyNet:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarFilme();
  }, [id]);

  // 3. INICIALIZAÇÃO DO PLAYER UNIVERSAL
  useEffect(() => {
    if (filme?.video && videoRef.current) {
      const video = videoRef.current;
      const videoUrl = filme.video.trim();

      if (hlsRef.current) hlsRef.current.destroy();
      setErrorStatus(false);

      // Verificação de HLS (.m3u8)
      if (videoUrl.includes("m3u8")) {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hlsRef.current = hls;
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setErrorStatus(true); });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        }
      } else {
        // MP4, MKV E LINKS DE CDN (COMO O SEU)
        video.src = videoUrl;
        video.load();
      }
    }
    return () => hlsRef.current?.destroy();
  }, [filme]);

  const salvarTempo = () => {
    if (videoRef.current && id) {
      localStorage.setItem(`tempo-${id}`, videoRef.current.currentTime.toString());
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h1 className="text-white font-black tracking-[0.3em] uppercase animate-pulse text-[10px]">Acessando SkyNet...</h1>
    </div>
  );

  if (!filme) return null;

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans selection:bg-red-600 overflow-x-hidden">
      {/* Background Dinâmico */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-[100px] scale-125" style={{ backgroundImage: `url(${filme.capa})` }} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Modal Retomar */}
      <AnimatePresence>
        {modalRetomar && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0c0c0c] p-10 rounded-[2.5rem] border border-white/5 text-center max-w-sm shadow-2xl">
              <FiClock className="text-red-600 text-5xl mx-auto mb-6" />
              <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter">Retomar de onde parou?</h2>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { videoRef.current.currentTime = tempoSalvo; videoRef.current.play(); setModalRetomar(false); }}
                  className="bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  Continuar
                </button>
                <button onClick={() => setModalRetomar(false)} className="text-zinc-500 py-2 font-black uppercase text-[10px]">Do início</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="mb-12 flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
          <FiChevronLeft size={20} /> Voltar para o Catálogo
        </button>

        <div className="grid gap-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="bg-red-600 text-[9px] font-black uppercase px-2 py-1 rounded-sm tracking-[0.2em]">Full HD</span>
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">{id}</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none drop-shadow-2xl">{filme.titulo}</h1>
          </div>

          {/* Player de Vídeo */}
          <div className="relative aspect-video bg-black rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl group">
            {errorStatus && (
              <div className="absolute inset-0 z-20 bg-zinc-900 flex flex-col items-center justify-center text-center p-6">
                <FiAlertCircle className="text-red-600 text-4xl mb-4" />
                <p className="font-black uppercase text-xs tracking-widest mb-2">Erro de Fonte de Mídia</p>
                <p className="text-zinc-500 text-[10px] max-w-xs">O link fornecido está bloqueado pelo servidor de origem ou expirou.</p>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              controls 
              autoPlay 
              onPause={salvarTempo}
              onEnded={salvarTempo}
              playsInline
              // IMPORTANTE: Tenta burlar bloqueios de segurança
              referrerPolicy="no-referrer"
              className="w-full h-full cursor-pointer"
              onError={() => setErrorStatus(true)}
            />
          </div>

          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 max-w-3xl">
             <h3 className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2"><FiInfo /> Sinopse</h3>
             <p className="text-zinc-400 text-xl font-medium italic leading-relaxed">{filme.descricao}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        video::-webkit-media-controls-panel { background-image: linear-gradient(transparent, rgba(0,0,0,0.9)) !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}