"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.appspot.com",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const frases = [
  "Filmes gratuitos, do seu jeito",
  "Atualizações todos os dias",
  "Uma experiência de cinema em casa",
  "Aperte o play e aproveite",
  "O filme começa agora",
];

const imagensFundo = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJw5ZatGkLYonPz8EhPv2RxSyjqpUYCqcVCQ&s",
  "https://all.web.img.acsta.net/r_2500_x/img/7b/f6/7bf620158d5ecac7f84908a3a6dab8c5.png",
  "https://br.web.img2.acsta.net/pictures/22/09/23/20/14/0505071.jpg",
];

function Modal() {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-80 text-center shadow-2xl border border-zinc-700 animate-pulse">
        <h2 className="text-green-400 font-bold text-lg mb-2">
          Login aprovado
        </h2>
        <p className="text-zinc-300">
          Encaminhando para os filmes...
        </p>
      </div>
    </div>
  );
}

export default function SkycineLogin() {
  const [fraseAtual, setFraseAtual] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseAtual((prev) => (prev + 1) % frases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImagemAtual((prev) => (prev + 1) % imagensFundo.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setShowModal(true);
      setTimeout(() => {
        window.location.replace("/Home");
      }, 1500);
    } catch {
      alert("Erro ao fazer login com Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {imagensFundo.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
              index === imagemAtual
                ? "opacity-100 scale-105"
                : "opacity-0 scale-100"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-white mb-2">
          Sky<span className="text-zinc-400">cine</span>
        </h1>

        <p className="text-center text-zinc-400 mb-2 italic transition-all duration-500">
          {frases[fraseAtual]}
        </p>

        <p className="text-center text-red-500 text-sm mb-6 animate-pulse tracking-widest uppercase">
          Em breve
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition shadow-lg"
        >
          <FcGoogle size={22} />
          Entrar com Google
        </button>

        <div className="mt-6 text-center text-xs text-zinc-500">
          © Skycine • Filmes gratuitos • Atualizações diárias
        </div>
      </div>

      {showModal && <Modal />}
    </div>
  );
}
