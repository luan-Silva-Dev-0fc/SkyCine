"use client";

import { useEffect, useRef, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

export default function Page() {
  const [videos, setVideos] = useState([]);
  const [playing, setPlaying] = useState([]);
  const [quality, setQuality] = useState([]);
  const [menu, setMenu] = useState([]);
  const refs = useRef([]);

  useEffect(() => {
    async function carregar() {
      const snap = await getDocs(collection(db, "cdstack"));
      const list = snap.docs.map(d => d.data());
      setVideos(list);
      setPlaying(list.map(() => false));
      setQuality(list.map(() => ""));
      setMenu(list.map(() => false));
    }
    carregar();
  }, []);

  function playVideo(i) {
    const v = refs.current[i];
    if (!v) return;
    v.play();
    v.controls = true;
    setPlaying(p => {
      const n = [...p];
      n[i] = true;
      return n;
    });
  }

  function updateQuality(i) {
    const v = refs.current[i];
    if (!v) return;
    setQuality(q => {
      const n = [...q];
      n[i] = `${v.videoWidth}x${v.videoHeight}`;
      return n;
    });
  }

  function fullscreen(i) {
    const v = refs.current[i];
    if (v?.requestFullscreen) v.requestFullscreen();
  }

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-hidden">
      {videos.map((item, i) => (
        <section
          key={i}
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
        >
          <div
            className="fixed inset-0 bg-cover bg-center scale-125 blur-2xl"
            style={{ backgroundImage: `url(${item.capa})` }}
          />
          <div className="fixed inset-0 bg-black/70" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6">
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-red-600">
                SkyCine
              </h1>

              <button
                onClick={() =>
                  setMenu(m => {
                    const n = [...m];
                    n[i] = !n[i];
                    return n;
                  })
                }
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </button>
            </header>

            {menu[i] && (
              <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-xl rounded-xl p-3 space-y-2 shadow-2xl">
                <button
                  onClick={() => fullscreen(i)}
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Tela cheia
                </button>
                <div className="px-4 py-2 text-sm text-gray-400">
                  Qualidade {quality[i] || "Auto"}
                </div>
                <div className="px-4 py-2 text-sm text-gray-400">
                  Espelhamento automático
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <img
                src={item.capa}
                className="w-full md:w-60 h-80 object-cover rounded-2xl shadow-2xl"
              />

              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                  {item.titulo}
                </h2>

                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
                  {quality[i] && (
                    <span className="px-3 py-1 rounded-full bg-white/10">
                      {quality[i]}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-white/10">
                    Streaming
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10">
                    Online
                  </span>
                </div>

                <p className="text-gray-300 text-sm max-w-2xl">
                  Experiência cinematográfica otimizada para qualquer tela,
                  carregamento rápido e visual moderno.
                </p>
              </div>
            </div>

            <div className="relative mt-10">
              <video
                ref={el => (refs.current[i] = el)}
                src={item.video}
                onLoadedMetadata={() => updateQuality(i)}
                className="w-full rounded-2xl bg-black shadow-2xl"
              />

              {!playing[i] && (
                <button
                  onClick={() => playVideo(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
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
        </section>
      ))}
    </div>
  );
}
