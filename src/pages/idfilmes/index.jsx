"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

export default function Assistir() {
  const app = useMemo(
    () => (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()),
    []
  );
  const db = useMemo(() => getFirestore(app), [app]);

  const [filme, setFilme] = useState(null);
  const [media, setMedia] = useState("0.0");
  const [playing, setPlaying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const carregar = async () => {
      const id = new URLSearchParams(window.location.search).get("id");
      if (!id) return;

      const ref = doc(db, "filmes", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setFilme(data);
        if (data.totalVotos) {
          setMedia((data.avaliacao / data.totalVotos).toFixed(1));
        }
      }
    };

    carregar();
  }, [db]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !filme) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const tempoSalvo = localStorage.getItem(`video-${id}`);
    if (tempoSalvo) {
      setSavedTime(parseFloat(tempoSalvo));
      setModalOpen(true);
    }

    const salvarProgresso = () => {
      localStorage.setItem(`video-${id}`, video.currentTime.toString());
    };

    video.addEventListener("pause", salvarProgresso);
    window.addEventListener("beforeunload", salvarProgresso);

    return () => {
      video.removeEventListener("pause", salvarProgresso);
      window.removeEventListener("beforeunload", salvarProgresso);
    };
  }, [filme]);

  const continuarVideo = () => {
    videoRef.current.currentTime = savedTime;
    videoRef.current.play();
    setPlaying(true);
    setModalOpen(false);
  };

  const começarDoInicio = () => {
    videoRef.current.play();
    setPlaying(true);
    setModalOpen(false);
  };

  if (!filme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm text-center">
            <h2 className="text-red-600 font-bold text-lg mb-4">
              Continuar de onde parou?
            </h2>
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
          </div>
        </div>
      )}

      <section className="relative w-full">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
          style={{ backgroundImage: `url(${filme.capa})` }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
          <h1
            className="font-bold text-red-600 leading-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            {filme.titulo}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mt-1">
            Avaliação média {media}
          </p>
          <div className="relative mt-4 sm:mt-6">
            <video
              ref={videoRef}
              src={filme.filme}
              preload="metadata"
              controls={playing}
              className="
                w-full
                rounded-2xl
                bg-black
                shadow-2xl
                max-h-[55vh]
                sm:max-h-[60vh]
                md:max-h-[65vh]
                lg:max-h-[70vh]
              "
            />
            {!playing && (
              <button
                onClick={() => {
                  videoRef.current?.play();
                  setPlaying(true);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl"
              >
                <div
                  className="
                    bg-red-600 rounded-full flex items-center justify-center
                    w-14 h-14
                    sm:w-16 sm:h-16
                    md:w-20 md:h-20
                    text-xl sm:text-2xl
                  "
                >
                  ▶
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          <img
            src={filme.capa}
            loading="lazy"
            className="
              w-full
              sm:w-48
              md:w-56
              h-64
              sm:h-72
              object-cover
              rounded-xl
              shadow-xl
            "
          />
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3 text-xs sm:text-sm text-gray-300">
              <span className="px-3 py-1 rounded-full bg-white/10">HD</span>
              <span className="px-3 py-1 rounded-full bg-white/10">Online</span>
              <span className="px-3 py-1 rounded-full bg-white/10">Streaming</span>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {filme.descricao || "Assista com qualidade máxima e reprodução fluida."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
