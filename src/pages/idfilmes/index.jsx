"use client";

import { useEffect, useRef, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Assistir() {
  const firebaseConfig = {
    apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
    authDomain: "skycine-c59b0.firebaseapp.com",
    projectId: "skycine-c59b0",
    storageBucket: "skycine-c59b0.firebasestorage.app",
    messagingSenderId: "1084857538934",
    appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);

  const [filme, setFilme] = useState(null);
  const [media, setMedia] = useState("0.0");
  const [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    async function carregarFilme() {
      const id = new URLSearchParams(window.location.search).get("id");
      if (!id) return;

      const ref = doc(db, "filmes", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setFilme({ id, ...data });
        if (data.totalVotos) {
          setMedia((data.avaliacao / data.totalVotos).toFixed(1));
        }
      }
    }

    carregarFilme();
  }, []);

  function playVideo() {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  }

  function fullscreen() {
    if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
  }

  if (!filme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-lg">
        Carregando conteúdo...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-80 md:h-[450px] lg:h-[550px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-2xl"
          style={{ backgroundImage: `url(${filme.capa})` }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute bottom-6 left-6 z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-red-600">{filme.titulo}</h1>
          <p className="text-gray-300 text-sm mt-1">Avaliação média {media}</p>
        </div>
        <button
          onClick={() => setMenu(!menu)}
          className="absolute top-6 right-6 w-10 h-10 flex flex-col justify-between items-center p-1 bg-white/10 rounded-full z-20"
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
        </button>

        {menu && (
          <div className="absolute top-16 right-6 bg-black/80 backdrop-blur-xl rounded-xl p-3 space-y-2 shadow-2xl z-20">
            <button
              onClick={fullscreen}
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Tela cheia
            </button>
            <div className="px-4 py-2 text-sm text-gray-300">
              Qualidade {videoRef.current?.videoWidth}x{videoRef.current?.videoHeight || "auto"}
            </div>
            <div className="px-4 py-2 text-sm text-gray-300">Espelhamento</div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <img
            src={filme.capa}
            className="w-full md:w-60 h-80 object-cover rounded-2xl shadow-2xl"
          />
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">{filme.titulo}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10">Alta definição</span>
              <span className="px-3 py-1 rounded-full bg-white/10">Streaming contínuo</span>
              <span className="px-3 py-1 rounded-full bg-white/10">Disponível agora</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {filme.descricao || "Assista a este título em alta qualidade, com reprodução fluida e interface moderna."}
            </p>
            <p className="mt-4 text-gray-200">Avaliação média: <strong>{media}</strong></p>
          </div>
        </div>

        <div className="relative group">
          <video
            ref={videoRef}
            src={filme.filme}
            controls={playing}
            className="w-full rounded-2xl shadow-2xl bg-black"
          />

          {!playing && (
            <button
              onClick={playVideo}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl transition group-hover:bg-black/60"
            >
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl">
                <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10 ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
