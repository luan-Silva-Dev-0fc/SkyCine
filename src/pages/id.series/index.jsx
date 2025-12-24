"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

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

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [capa, setCapa] = useState("");
  const [episodios, setEpisodios] = useState([]);
  const [videoAtual, setVideoAtual] = useState("");
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaSelecionada, setTemporadaSelecionada] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [savedTime, setSavedTime] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function carregarSerie() {
      const ref = doc(db, "conteudos", String(id));
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setTitulo(data.titulo);
        setDescricao(data.descricao);
        setCapa(data.capa);
        setEpisodios(data.episodios || []);
        if (data.episodios?.length > 0) {
          setVideoAtual(data.episodios[0].link);
        }

        const q = query(
          collection(db, "conteudos"),
          where("idSerie", "==", data.idSerie)
        );
        const snapTemp = await getDocs(q);
        const tempList = snapTemp.docs
          .map(doc => ({ idDoc: doc.id, ...doc.data() }))
          .sort((a, b) => a.temporada - b.temporada);
        setTemporadas(tempList);
        setTemporadaSelecionada(tempList.find(t => t.idDoc === id));
      }
    }

    carregarSerie();
  }, [id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoAtual) return;

    const saved = localStorage.getItem(`video-${videoAtual}`);
    if (saved) {
      setSavedTime(parseFloat(saved));
      setModalOpen(true);
    }

    const salvarProgresso = () => {
      localStorage.setItem(`video-${videoAtual}`, video.currentTime.toString());
    };

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

  const trocarTemporada = (temp) => {
    setTemporadaSelecionada(temp);
    setTitulo(temp.titulo + " - Temporada " + temp.temporada);
    setDescricao(temp.descricao);
    setCapa(temp.capa);
    setEpisodios(temp.episodios || []);
    if (temp.episodios?.length > 0) {
      setVideoAtual(temp.episodios[0].link);
    }
  };

  return (
    <div className="min-h-screen text-white bg-black relative">
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

      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{ backgroundImage: `url(${capa})` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 px-4 sm:px-8 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl sm:text-5xl font-bold">{titulo}</h1>
          {temporadas.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {temporadas.map(temp => (
                <button
                  key={temp.idDoc}
                  onClick={() => trocarTemporada(temp)}
                  className={`px-3 py-1 rounded-lg font-medium ${
                    temporadaSelecionada?.idDoc === temp.idDoc
                      ? "bg-red-600"
                      : "bg-white/10 hover:bg-red-600/70"
                  } transition-colors`}
                >
                  Temporada {temp.temporada}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="max-w-3xl text-sm sm:text-base text-gray-200 mb-8 border-l-4 border-red-600 pl-4">
          {descricao}
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
          {temporadaSelecionada && (
            <div className="absolute top-2 right-2 bg-white/20 text-white text-xs px-2 py-1 rounded">
              ID da Série: {temporadaSelecionada.idSerie}
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Episódios</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {episodios.map(ep => (
            <div
              key={ep.numero}
              onClick={() => setVideoAtual(ep.link)}
              className="cursor-pointer bg-white/10 hover:bg-red-600/80 transition-all duration-300 rounded-lg p-3 flex flex-col items-center justify-center aspect-video transform hover:scale-105 shadow-lg"
            >
              <span className="font-bold text-lg">EP {ep.numero}</span>
              <span className="text-xs opacity-80 mt-1">Assistir</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
