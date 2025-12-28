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
  const [heroIndex, setHeroIndex] = useState(0);

  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);
  const [showLojaModal, setShowLojaModal] = useState(false);
  const [showVoiceErrorModal, setShowVoiceErrorModal] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const filmesSnap = await getDocs(collection(db, "filmes"));
        setFilmes(
          filmesSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .reverse()
            .filter(f => f.capa && f.titulo)
        );

        const destaquesSnap = await getDocs(collection(db, "cdstack"));
        setDestaques(
          destaquesSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .reverse()
            .filter(d => d.capa && d.titulo && (d.video || d.url || d.link))
        );

        const seriesSnap = await getDocs(collection(db, "conteudos"));
        setSeries(
          seriesSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .reverse()
            .filter(s => s.capa && s.titulo)
        );
      } catch (e) {}
    }

    carregarDados();
  }, []);

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setShowVoiceErrorModal(true);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setListening(false);

      if (
        transcript.includes("loja") ||
        transcript.includes("input para a loja") ||
        transcript.includes("encaminhar para a loja")
      ) {
        setShowLojaModal(true);
        setTimeout(() => {
          router.push("/loja");
        }, 2000);
        return;
      }

      setSearch(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.start();
  };

  const hero = destaques[heroIndex % (destaques.length || 1)];

  const filmesFiltrados = filmes.filter(f =>
    f.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">

      {hero && (
        <section className="relative h-[75vh] w-full overflow-hidden">
          <video
            key={hero.id}
            src={hero.video || hero.url || hero.link}
            autoPlay
            muted
            loop
            playsInline
            poster={hero.capa}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="absolute top-6 left-6 z-40">
            <button
              className="flex flex-col gap-1 w-8 h-8 justify-center items-center"
              onClick={() => setMenuOpen(true)}
            >
              <span className="w-full h-0.5 bg-white"></span>
              <span className="w-full h-0.5 bg-white"></span>
              <span className="w-full h-0.5 bg-white"></span>
            </button>
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-widest text-white/90">
              SkyCine
            </h1>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full w-[90vw] max-w-md border border-white/20">
              <input
                type="text"
                placeholder="Buscar filmes, séries..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-white/60"
              />

              <button
                onClick={startVoiceSearch}
                className="relative w-9 h-9 flex items-center justify-center"
              >
                {listening && (
                  <>
                    <span className="absolute w-full h-full rounded-full animate-ping bg-red-500/40"></span>
                    <span className="absolute w-7 h-7 rounded-full animate-pulse bg-red-500/30"></span>
                  </>
                )}

                <img
                  src="https://static.vecteezy.com/system/resources/previews/028/766/358/non_2x/google-mic-microphone-icon-symbol-free-png.png"
                  className="w-5 h-5 z-10"
                />
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 left-6 z-20">
            <h2 className="text-4xl font-bold mb-4">{hero.titulo}</h2>
            <div className="flex gap-3">
              <button
                className="px-6 py-3 bg-red-600 rounded-lg"
                onClick={() => router.push(`/id.destaques?id=${hero.id}`)}
              >
                Assistir agora
              </button>
              <button
                className="px-6 py-3 bg-white/10 rounded-lg"
                onClick={() => setHeroIndex(i => i + 1)}
              >
                Ver próximo
              </button>
            </div>
          </div>
        </section>
      )}

      <div
        className={`fixed inset-0 bg-black/60 z-40 ${
          menuOpen ? "block" : "hidden"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 w-72 h-full bg-gradient-to-b from-gray-800 to-gray-900 p-6 z-50 transform transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="self-end mb-6 text-2xl"
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
          { label: "Configurações", path: "/configuracoes" },
        ].map(item => (
          <button
            key={item.path}
            className="w-full px-4 py-3 mb-2 bg-white/5 rounded-lg"
            onClick={() => {
              router.push(item.path);
              setMenuOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <section className="py-8 px-4">
        <h2 className="text-xl font-bold mb-6">Filmes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filmesFiltrados.map(filme => (
            <div key={filme.id} className="bg-white/5 rounded-xl overflow-hidden">
              <img src={filme.capa} className="w-full aspect-[2/3] object-cover" />
              <div className="p-3">
                <div className="text-sm text-center mb-2">{filme.titulo}</div>
                <button
                  className="w-full bg-red-600 py-2 rounded-lg"
                  onClick={() => router.push(`/idfilmes?id=${filme.id}`)}
                >
                  Assistir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showLojaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl text-center animate-pulse">
            <h2 className="text-lg font-bold mb-2">Loja Secreta</h2>
            <p>Estamos encaminhando para a loja secreta...</p>
          </div>
        </div>
      )}

      {showVoiceErrorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h2 className="text-lg font-bold mb-2">Comando de voz indisponível</h2>
            <p>Seu navegador não suporta reconhecimento de voz.</p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 rounded-lg"
              onClick={() => setShowVoiceErrorModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
