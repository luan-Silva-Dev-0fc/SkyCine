"use client";

import { useEffect, useState, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.appspot.com",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const frases = [
  "O melhor do cinema na sua tela",
  "Experiência 4K sem interrupções",
  "Sua pipoca merece esse player",
  "Milhares de títulos a um clique",
  "A evolução do seu streaming pessoal",
];

const imagensFundo = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000",
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000",
];

function Modal({
  titulo = "Preparando Sala...",
  subtitulo = "Sincronizando Metadados 4K",
}) {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-xl">
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 border-t-4 border-red-600 rounded-full animate-spin" />
          <div className="absolute inset-2 border-t-4 border-white/10 rounded-full animate-spin-slow" />
          <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full" />
        </div>
        <h2 className="text-white font-black text-3xl uppercase italic tracking-tighter transition-all">
          {titulo}
        </h2>
        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-3 animate-pulse">
          {subtitulo}
        </p>
      </div>
    </div>
  );
}

export default function SkyCineLogin() {
  const [fraseAtual, setFraseAtual] = useState(0);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [userName, setUserName] = useState("");
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => null);
    }
  }, []);

  useEffect(() => {
    const fraseTimer = setInterval(
      () => setFraseAtual((v) => (v + 1) % frases.length),
      5000
    );
    const imagemTimer = setInterval(
      () => setImagemAtual((v) => (v + 1) % imagensFundo.length),
      8000
    );
    return () => {
      clearInterval(fraseTimer);
      clearInterval(imagemTimer);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isRedirecting.current) {
        isRedirecting.current = true;
        setUserName(user.displayName?.split(" ")[0] || "Cliente");
        setLoggingIn(true);

        setTimeout(() => {
          window.location.href = "/Home";
        }, 1500);
      } else if (!user) {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (loggingIn) return;
    try {
      setLoggingIn(true);
      await signInWithPopup(auth, provider);
    } catch (error) {
      setLoggingIn(false);
      console.error("Erro login:", error);
    }
  };

  if (checkingAuth && !loggingIn)
    return <Modal titulo="SKY CINE" subtitulo="Autenticando..." />;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020202]">
      <div className="absolute inset-0 z-0">
        {imagensFundo.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ease-in-out ${
              index === imagemAtual
                ? "opacity-40 scale-110"
                : "opacity-0 scale-100"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-sm mb-4 tracking-[0.3em] uppercase">
            Streaming Original
          </div>
          <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
            SKY<span className="text-red-600">CINE</span>
          </h1>
          <div className="h-8 mt-2">
            <p className="text-zinc-400 text-sm italic font-medium">
              "{frases[fraseAtual]}"
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <h3 className="text-white text-center mb-10 font-light text-xl">
            Bem-vindo à <span className="font-bold">Nova Era</span>
          </h3>

          <button
            onClick={handleGoogleLogin}
            disabled={loggingIn}
            className="group w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all uppercase text-[11px] tracking-[0.2em] disabled:opacity-50"
          >
            <FcGoogle size={24} />
            Iniciar Sessão
          </button>

          <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-zinc-500 text-[9px] uppercase font-black tracking-[0.2em]">
                Servidores UHD Ativos
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-zinc-700 text-[10px] uppercase tracking-[0.5em] font-bold">
          SkyCine &bull; Premium Experience
        </p>
      </div>

      {loggingIn && (
        <Modal
          titulo={`Olá, ${userName}!`}
          subtitulo="Seja bem-vindo de volta, cliente SkyCine."
        />
      )}

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}