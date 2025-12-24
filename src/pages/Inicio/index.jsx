"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const [filmes, setFilmes] = useState([]);
  const [destaques, setDestaques] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      const filmesSnap = await getDocs(collection(db, "filmes"));
      const filmesData = filmesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setFilmes(filmesData);

      const destaquesSnap = await getDocs(collection(db, "cdstack"));
      const destaquesData = destaquesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setDestaques(destaquesData);

      const seriesSnap = await getDocs(collection(db, "conteudos"));
      const seriesData = seriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setSeries(seriesData);
    }

    carregarDados();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans relative">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-black/70 backdrop-blur-md border-b border-white/5">
        <h1 className="text-xl font-bold tracking-wide">SkyCine</h1>
        <button
          className="flex flex-col gap-1 w-7 h-7 justify-center items-center"
          onClick={() => setMenuOpen(true)}
        >
          <span className="block w-full h-0.5 bg-white rounded"></span>
          <span className="block w-full h-0.5 bg-white rounded"></span>
          <span className="block w-full h-0.5 bg-white rounded"></span>
        </button>
      </header>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 w-4/5 sm:w-72 h-full bg-gradient-to-b from-gray-800 to-gray-900 p-6 flex flex-col gap-4 z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="self-end mb-4 text-white text-2xl font-bold"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>
        {[
          { label: "Séries", path: "/series" },
          { label: "Comédia", path: "/comedia" },
          { label: "Terror", path: "/terror" },
          { label: "Ação", path: "/acao" },
          { label: "Animes", path: "/animes" },
          { label: "IPTV", path: "/iptv" },
          { label: "Mais opções", path: "/mais-opcoes" },
          { label: "Configurações", path: "/configuracoes" },
        ].map(item => (
          <button
            key={item.path}
            className="px-4 py-3 bg-white/5 rounded-lg hover:bg-red-600/70 transition-colors font-medium text-sm sm:text-base"
            onClick={() => {
              router.push(item.path);
              setMenuOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <section className="py-6 px-4 sm:px-6">
        <h2 className="text-2xl font-bold mb-6">Destaques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {destaques.map(item => (
            <div key={item.id} className="bg-white/5 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
              <img src={item.capa} className="w-full aspect-[2/3] object-cover" />
              <div className="p-4">
                <div className="font-medium text-center mb-3">{item.titulo}</div>
                <button
                  className="w-full py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  onClick={() => router.push(`/id.destaques?id=${item.id}`)}
                >
                  Assistir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-6 px-4 sm:px-6 border-t border-white/5">
  <h2 className="text-2xl font-bold mb-6">Séries</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
    {series.map(serie => (
      <div
        key={serie.id}
        className="bg-white/5 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform"
      >
        <img
          src={serie.capa}
          className="w-full aspect-[2/3] object-cover"
        />
        <div className="p-3">
          <div className="font-medium text-sm text-center mb-2">
            {serie.titulo}
          </div>
          <button
            className="w-full py-1 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
            onClick={() => router.push(`/id.series?id=${serie.id}`)}
          >
            Assistir
          </button>
        </div>
      </div>
    ))}
  </div>
</section>


      <section className="py-6 px-4 sm:px-6 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">Filmes Recentes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {filmes.map(filme => (
            <div key={filme.id} className="bg-white/5 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
              <img src={filme.capa} className="w-full aspect-[2/3] object-cover" />
              <div className="p-3">
                <div className="font-medium text-sm text-center mb-2">{filme.titulo}</div>
                <button
                  className="w-full py-1 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                  onClick={() => router.push(`/idfilmes?id=${filme.id}`)}
                >
                  Assistir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
