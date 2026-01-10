"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Head from "next/head";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.appspot.com",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const frases = [
  "O melhor do cinema na sua tela",
  "Experiência 4K sem interrupções",
  "Sua pipoca merece esse player",
  "Milhares de títulos a um clique",
  "A evolução do seu streaming pessoal"
];

const imagensFundo = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000",
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000"
];

function Modal() {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-md">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-t-4 border-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-t-4 border-white/20 rounded-full animate-spin-slow"></div>
        </div>
        <h2 className="text-white font-black text-2xl uppercase italic">
          Preparando Sala...
        </h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          Sincronizando Metadados 4K
        </p>
      </div>
    </div>
  );
}

export default function SkyCineLogin() {
  const [fraseAtual, setFraseAtual] = useState(0);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const f = setInterval(() => {
      setFraseAtual(v => (v + 1) % frases.length);
    }, 4000);

    const i = setInterval(() => {
      setImagemAtual(v => (v + 1) % imagensFundo.length);
    }, 6000);

    return () => {
      clearInterval(f);
      clearInterval(i);
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setShowModal(true);
      setTimeout(() => window.location.replace("/Home"), 2500);
    } catch {
      alert("Erro ao autenticar no SkyCine.");
    }
  };

  return (
    <>
      <Head>
        <title>SkyCine</title>
        <meta name="description" content="Aplicativo oficial SkyCine" />
        <meta name="theme-color" content="#020617" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 z-0">
          {imagensFundo.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[4000ms] ${
                index === imagemAtual ? "opacity-30 scale-110" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10 w-full max-w-[400px] px-6">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black text-white uppercase italic">
              Sky<span className="text-red-600">Cine</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-4 italic">
              "{frases[fraseAtual]}"
            </p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-all uppercase text-xs tracking-widest"
            >
              <FcGoogle size={22} />
              Iniciar Sessão
            </button>
          </div>
        </div>

        {showModal && <Modal />}

        <style jsx global>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
}
