"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const [categorias, setCategorias] = useState([]);
  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // Modal secreto
  const [showModal, setShowModal] = useState(false);
  const [codigoAnimado, setCodigoAnimado] = useState("");

  const firebaseConfig = {
    apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
    authDomain: "skycine-c59b0.firebaseapp.com",
    projectId: "skycine-c59b0",
    storageBucket: "skycine-c59b0.firebasestorage.app",
    messagingSenderId: "1084857538934",
    appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  };

  const app = useMemo(
    () => (getApps().length ? getApp() : initializeApp(firebaseConfig)),
    []
  );
  const db = useMemo(() => getFirestore(app), [app]);

  const loadData = async () => {
    setLoading(true);

    const categoriasSnap = await getDocs(collection(db, "categorias"));
    const categoriasArray = categoriasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategorias(categoriasArray);

    const filmesArray = [];
    const seriesArray = [];

    for (const cat of categoriasArray) {
      const filmesSnap = await getDocs(collection(db, "categorias", cat.id, "filmes"));
      filmesSnap.forEach(f => {
        const data = f.data();
        filmesArray.push({
          id: f.id,
          categoriaId: cat.id,
          categoriaNome: cat.nome,
          titulo: data.titulo,
          capa: data.capa,
          video: data.video,
        });
      });

      const seriesSnap = await getDocs(collection(db, "categorias", cat.id, "series"));
      seriesSnap.forEach(s => {
        const data = s.data();
        let capaSerie = data.capa;
        if (!capaSerie && data.temporadas?.length > 0 && data.temporadas[0].capitulos?.length > 0) {
          capaSerie = data.temporadas[0].capitulos[0].video;
        }
        seriesArray.push({
          id: s.id,
          categoriaId: cat.id,
          categoriaNome: cat.nome,
          titulo: data.titulo,
          capa: capaSerie || "",
        });
      });
    }

    setFilmes(filmesArray);
    setSeries(seriesArray);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filmesFiltrados = filmes.filter(f => f.titulo.toLowerCase().includes(search.toLowerCase()));
  const seriesFiltradas = series.filter(s => s.titulo.toLowerCase().includes(search.toLowerCase()));

  const filmeDestaque = useMemo(() => {
    if (!filmes.length) return null;
    return filmes[Math.floor(Math.random() * filmes.length)];
  }, [filmes]);

  // Efeito antigo de swipe para loja
  useEffect(() => {
    let startX = null;
    let startY = null;

    const touchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const touchMove = (e) => {
      if (startX === null || startY === null) return;
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      if (deltaX > 50 && deltaY > 50) {
        router.push("/loja");
        startX = null;
        startY = null;
      }
    };

    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchmove", touchMove);

    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
    };
  }, [router]);

  // Detecção de L com modal, fala e animação
  useEffect(() => {
    let touchPath = [];
    const maxPathLength = 20;

    const speak = (message) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utterance);
      }
    };

    const touchStart = (e) => {
      touchPath = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }];
    };

    const touchMove = (e) => {
      const point = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (touchPath.length < maxPathLength) touchPath.push(point);

      if (touchPath.length > 5) {
        const start = touchPath[0];
        const mid = touchPath[Math.floor(touchPath.length / 2)];
        const end = touchPath[touchPath.length - 1];

        const verticalMove = mid.y - start.y > 50 && Math.abs(mid.x - start.x) < 50;
        const horizontalMove = end.x - mid.x > 50 && Math.abs(end.y - mid.y) < 50;

        if (verticalMove && horizontalMove && !showModal) {
          speak("Ok, já entendi este comando. Estou encaminhando você para nossa nossa loja secreta.");
          setShowModal(true);

          const linhas = [
            "Carregando módulo secreto...",
            "Autenticando usuário...",
            "Conectando ao servidor...",
            "Abrindo portal da loja secreta..."
          ];

          let i = 0;
          const interval = setInterval(() => {
            setCodigoAnimado(linhas[i]);
            i++;
            if (i >= linhas.length) {
              clearInterval(interval);
              router.push("/loja");
            }
          }, 1000);
        }
      }
    };

    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchmove", touchMove);

    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
    };
  }, [router, showModal]);

  if (loading) return <div className="text-white p-6">Carregando...</div>;

  return (
    <div className="min-h-screen relative bg-gray-900 text-white overflow-hidden">

      {filmeDestaque && (
        <div className="relative w-full h-[60vh] overflow-hidden">
          <video
            src={filmeDestaque.video}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
          {filmeDestaque.capa && (
            <div className="absolute bottom-6 left-6 flex flex-col gap-4">
              <img src={filmeDestaque.capa} className="w-40 md:w-60 rounded-lg shadow-xl" alt={filmeDestaque.titulo} />
              <button
                onClick={() => router.push(`/idfilmes?id=${filmeDestaque.id}`)}
                className="bg-red-600 py-2 px-6 rounded-lg font-bold hover:bg-red-700"
              >
                Assistir
              </button>
            </div>
          )}
        </div>
      )}

      {/* Topo */}
      <div className="absolute top-0 left-0 w-full z-10 flex items-center justify-between py-4 px-6">
        <button onClick={() => setShowMenu(!showMenu)} className="flex flex-col gap-1">
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>
        <h1 className="text-4xl font-bold text-white">SkyCine</h1>
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-white cursor-pointer">
          P
        </div>
      </div>

      {/* Busca */}
      <div className="absolute top-20 left-0 w-full flex justify-center px-6 z-10">
        <input
          type="text"
          placeholder="Pesquisar filmes ou séries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-white/10 placeholder-white/70 px-4 py-2 rounded-full outline-none"
        />
      </div>

      {/* Menu lateral */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-full w-64 bg-gray-800 z-40 p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Categorias</h2>
              <button className="text-white font-bold" onClick={() => setShowMenu(false)}>×</button>
            </div>
            <ul className="flex flex-col gap-3">
              {categorias.map(cat => (
                <li key={cat.id} className="cursor-pointer hover:text-red-500" onClick={() => setShowMenu(false)}>
                  {cat.nome}
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full bg-gray-700 py-2 rounded-lg flex items-center justify-center gap-2">
              ⚙️ Configurações
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo */}
      <div className="relative z-10 mt-6 px-4 sm:px-6 md:px-8">
        {categorias.map(cat => (
          <div key={cat.id} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{cat.nome}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {filmesFiltrados.filter(f => f.categoriaId === cat.id).map(f => (
                <div key={f.id} className="bg-white/5 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <img src={f.capa} className="w-full aspect-[2/3] object-cover" />
                  <div className="p-2 flex flex-col items-center">
                    <div className="text-sm text-center mb-1">{f.titulo}</div>
                    <button
                      className="w-full bg-red-600 py-1 rounded-lg"
                      onClick={() => router.push(`/idfilmes?id=${f.id}`)}
                    >
                      Assistir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {seriesFiltradas.filter(s => s.categoriaId === cat.id).map(s => (
                <div key={s.id} className="bg-white/5 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <img src={s.capa} className="w-full aspect-[2/3] object-cover" />
                  <div className="p-2 flex flex-col items-center">
                    <div className="text-sm text-center mb-1">{s.titulo}</div>
                    <button
                      className="w-full bg-blue-600 py-1 rounded-lg"
                      onClick={() => router.push(`/idseries?id=${s.id}`)}
                    >
                      Assistir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal do código */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 text-green-400 p-8 rounded-xl w-80 text-center font-mono"
            >
              <p className="mb-4">💻 Sistema detectou seu comando secreto!</p>
              <p className="mb-2 animate-pulse">{codigoAnimado}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
