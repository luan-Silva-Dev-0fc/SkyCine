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

  if (!filme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative w-full">
        {/* FUNDO */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
          style={{ backgroundImage: `url(${filme.capa})` }}
        />
        <div className="absolute inset-0 bg-black/70" />

        {/* CONTEÚDO DO TOPO */}
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6">
          {/* TÍTULO */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">
            {filme.titulo}
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Avaliação média {media}
          </p>

          {/* PLAYER */}
          <div className="relative mt-5">
            <video
              ref={videoRef}
              src={filme.filme}
              preload="metadata"
              controls={playing}
              className="w-full max-h-[65vh] rounded-2xl bg-black shadow-2xl"
            />

            {!playing && (
              <button
                onClick={() => {
                  videoRef.current?.play();
                  setPlaying(true);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center text-2xl">
                  ▶
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DETALHES */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            src={filme.capa}
            className="w-full sm:w-52 h-72 object-cover rounded-xl shadow-xl"
            loading="lazy"
          />

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-300">
              <span className="px-3 py-1 rounded-full bg-white/10">HD</span>
              <span className="px-3 py-1 rounded-full bg-white/10">Online</span>
              <span className="px-3 py-1 rounded-full bg-white/10">
                Streaming
              </span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              {filme.descricao ||
                "Assista com qualidade máxima e reprodução fluida."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
