"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Serie() {
  const router = useRouter();
  const { id } = router.query;
  const videoRef = useRef(null);

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

  const [serie, setSerie] = useState(null);
  const [videoAtual, setVideoAtual] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTime, setSavedTime] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function carregarSerie() {
      // Percorrer todas as categorias para encontrar a série pelo ID
      const categoriasSnap = await getDocs(collection(db, "categorias"));
      let encontrada = null;

      for (const catDoc of categoriasSnap.docs) {
        const catId = catDoc.id;
        const seriesSnap = await getDocs(collection(db, "categorias", catId, "series"));
        for (const s of seriesSnap.docs) {
          if (s.id === id) {
            encontrada = { id: s.id, categoriaId: catId, ...s.data() };
            break;
          }
        }
        if (encontrada) break;
      }

      if (encontrada) {
        setSerie(encontrada);
        // Define o primeiro capítulo como vídeo inicial
        if (encontrada.temporadas?.length > 0 && encontrada.temporadas[0].capitulos?.length > 0) {
          setVideoAtual(encontrada.temporadas[0].capitulos[0].video);
        }
      }
    }

    carregarSerie();
  }, [id, db]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoAtual) return;

    const saved = localStorage.getItem(`video-${videoAtual}`);
    if (saved) {
      setSavedTime(parseFloat(saved));
      setModalOpen(true);
    }

    const salvarProgresso = () => localStorage.setItem(`video-${videoAtual}`, video.currentTime.toString());

    video.addEventListener("pause", salvarProgresso);
    window.addEventListener("beforeunload", salvarProgresso);

    return () => {
      video.removeEventListener("pause", salvarProgresso);
      window.removeEventListener("beforeunload", salvarProgresso);
    };
  }, [videoAtual]);

  const continuarVideo = () => {
    videoRef.current.currentTime = savedTime;
    videoRef.current.play();
    setModalOpen(false);
  };

  const começarDoInicio = () => {
    videoRef.current.play();
    setModalOpen(false);
  };

  const escolherCapitulo = (cap) => setVideoAtual(cap.video);

  return (
    <div className="min-h-screen relative text-white overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 opacity-30" />
      {serie?.capa && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105 opacity-40"
          style={{ backgroundImage: `url(${serie.capa})` }}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm text-center"
          >
            <h2 className="text-red-600 text-lg font-bold mb-4">Continuar de onde parou?</h2>
            <p className="text-gray-300 mb-6">
              Você parou em {Math.floor(savedTime / 60)}:
              {Math.floor(savedTime % 60).toString().padStart(2, "0")}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={continuarVideo}
                className="px-4 py-2 bg-red-600 rounded-lg font-semibold hover:bg-red-700"
              >
                Continuar
              </button>
              <button
                onClick={começarDoInicio}
                className="px-4 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500"
              >
                Começar do Início
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="relative z-10 px-4 sm:px-8 py-8 max-w-6xl mx-auto">
        {serie && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl sm:text-6xl font-bold">{serie.titulo}</h1>
                <div className="flex items-center gap-2 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-yellow-400 text-xl ${i < (serie.estrelas || 5) ? "" : "opacity-40"}`}>★</span>
                  ))}
                </div>
              </div>
            </div>

            <p className="max-w-3xl text-gray-200 mb-8 border-l-4 border-red-600 pl-4 text-sm sm:text-base">
              {serie.descricao}
            </p>

            <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-10 relative">
              {videoAtual && (
                <video
                  ref={videoRef}
                  src={videoAtual}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black rounded-xl"
                />
              )}
            </div>

            <h2 className="text-3xl font-semibold mb-6">Episódios</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {serie.temporadas?.map((t, i) =>
                t.capitulos?.map((cap, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    onClick={() => escolherCapitulo(cap)}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer bg-white/10 hover:bg-red-600/80 transition-all duration-300 rounded-lg p-3 flex flex-col items-center justify-center aspect-video shadow-lg"
                  >
                    <span className="font-bold text-lg">{cap.nome}</span>
                    <span className="text-xs opacity-80 mt-1">{cap.texto || "Assistir"}</span>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
