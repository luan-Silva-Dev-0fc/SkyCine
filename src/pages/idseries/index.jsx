"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiStar, FiChevronLeft, FiPlay, FiLayers, FiFastForward } from "react-icons/fi";

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

export default function PlayerSerie() {
  const router = useRouter();
  const { id } = router.query; 
  const videoRef = useRef(null);

  const [serie, setSerie] = useState(null);
  const [videoAtual, setVideoAtual] = useState("");
  const [capituloAtivo, setCapituloAtivo] = useState(null);
  const [tempAtivaIndex, setTempAtivaIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Importante: Só executa quando o roteador está pronto e o ID existe
    if (!router.isReady || !id) return;

    async function buscarSerie() {
      console.log("Buscando série com ID:", id); // DEBUG
      setLoading(true);
      try {
        // Tenta buscar na coleção global que configuramos no Admin
        const serieRef = doc(db, "todos_os_conteudos", String(id));
        const serieSnap = await getDoc(serieRef);

        if (serieSnap.exists()) {
          const dados = serieSnap.data();
          console.log("Dados encontrados:", dados); // DEBUG
          setSerie(dados);
          
          // Verifica se existem temporadas e capítulos
          const primeiraTemp = dados.temporadas?.[0];
          const primeiroCap = primeiraTemp?.capitulos?.[0];

          if (primeiroCap) {
            setVideoAtual(primeiroCap.video);
            setCapituloAtivo(primeiroCap);
          } else {
            console.warn("Série encontrada, mas está sem capítulos cadastrados.");
          }
        } else {
          console.error("Documento não existe no caminho: todos_os_conteudos/" + id);
        }
      } catch (err) {
        console.error("Erro Firebase:", err);
      } finally {
        setLoading(false);
      }
    }

    buscarSerie();
  }, [id, router.isReady]);

  const trocarEpisodio = (tempIdx, capIdx) => {
    const proximoCap = serie.temporadas[tempIdx]?.capitulos[capIdx];
    if (proximoCap) {
      setTempAtivaIndex(tempIdx);
      setVideoAtual(proximoCap.video);
      setCapituloAtivo(proximoCap);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const proximoEpisodio = () => {
    if (!serie) return;
    const currentTemp = serie.temporadas[tempAtivaIndex];
    const currentCapIdx = currentTemp.capitulos.findIndex(c => c.video === videoAtual);

    if (currentCapIdx < currentTemp.capitulos.length - 1) {
      trocarEpisodio(tempAtivaIndex, currentCapIdx + 1);
    } else if (tempAtivaIndex < serie.temporadas.length - 1) {
      trocarEpisodio(tempAtivaIndex + 1, 0);
    }
  };

  const monitorarTempo = () => {
    if (videoRef.current && videoRef.current.currentTime > 5) {
      localStorage.setItem(`progresso-${videoAtual}`, videoRef.current.currentTime.toString());
    }
  };

  if (!router.isReady || loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Caso o carregamento termine e não tenha série
  if (!serie) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Série não encontrada</h1>
      <button onClick={() => router.back()} className="px-6 py-2 bg-red-600 rounded-full font-bold">Voltar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600">
      
      {/* Background Cinematográfico */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-[100px] scale-125"
          style={{ backgroundImage: `url(${serie.capa})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
        <header className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
            <FiChevronLeft className="text-lg"/> Voltar
          </button>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
              <video 
                key={videoAtual}
                ref={videoRef}
                src={videoAtual}
                controls
                autoPlay
                onTimeUpdate={monitorarTempo}
                onEnded={proximoEpisodio}
                className="w-full h-full"
              />
            </div>

            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
               <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-2">{serie.titulo}</h1>
               <div className="flex items-center gap-4 text-[10px] font-bold text-red-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1 text-yellow-500"><FiStar className="fill-current"/> {serie.estrelas || "5.0"}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300">{capituloAtivo?.nome || "Carregando..."}</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><FiLayers className="text-red-600"/> Temporadas</h2>
                <select 
                  value={tempAtivaIndex}
                  onChange={(e) => setTempAtivaIndex(parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-bold outline-none"
                >
                  {serie.temporadas?.map((t, i) => <option key={i} value={i}>{t.nome}</option>)}
                </select>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {serie.temporadas?.[tempAtivaIndex]?.capitulos?.map((cap, j) => {
                  const isSelected = videoAtual === cap.video;
                  return (
                    <button
                      key={j}
                      onClick={() => trocarEpisodio(tempAtivaIndex, j)}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border ${isSelected ? "bg-red-600 border-red-400 shadow-lg shadow-red-600/20" : "bg-white/5 border-transparent hover:bg-white/10"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-white/20" : "bg-zinc-800"}`}>
                        {isSelected ? <FiPlay className="fill-current text-white"/> : <span className="text-[10px] font-black text-zinc-500">{j + 1}</span>}
                      </div>
                      <div className="text-left truncate">
                        <p className={`text-[10px] font-black uppercase truncate ${isSelected ? "text-white" : "text-zinc-300"}`}>{cap.nome}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}