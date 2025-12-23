"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Config Firebase
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
const db = getFirestore(app);

// Modal moderno com animação
function Modal({ title, message, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="bg-zinc-950 p-6 rounded-3xl w-80 border border-zinc-700 shadow-2xl transform transition-all duration-500 scale-90 animate-scaleIn">
        <h2 className="text-white text-2xl font-bold text-center mb-3">{title}</h2>
        <p className="text-zinc-400 text-center mb-5">{message}</p>
        {children}
      </div>
    </div>
  );
}

// Gera username aleatório
function gerarUsername(base) {
  const rand = Math.floor(Math.random() * 9999);
  const tags = ["DEV", "PRO", "X", "TV", "HD"];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  return `${base}_${tag}${rand}`;
}

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("loading");
  const [username, setUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
        return;
      }

      setUser(currentUser);

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists() || !snap.data().username) {
        setStatus("create");
        setShowModal(true);
      } else {
        setUsername(snap.data().username);
        setStatus("welcome");
        setShowModal(true);
        setTimeout(() => router.replace("/Inicio"), 1800);
      }
    });

    return () => unsub();
  }, [router]);

  const criarUsername = async () => {
    if (!usernameInput.trim()) return;

    const finalName = gerarUsername(usernameInput);

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        username: finalName,
        createdAt: new Date(),
      },
      { merge: true }
    );

    setUsername(finalName);
    setStatus("welcome");
    setShowModal(true);
    setTimeout(() => router.replace("/Inicio"), 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-800 flex flex-col items-center justify-center text-white p-4">
      
      {/* Modal de criação ou boas-vindas */}
      {showModal && status === "create" && (
        <Modal
          title="Criar nome de usuário"
          message="Escolha um nome. Um ID exclusivo será gerado automaticamente."
        >
          <input
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Digite seu nome"
            className="w-full mb-4 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300"
          />
          <button
            onClick={criarUsername}
            className="w-full bg-purple-600 py-2 rounded-2xl font-semibold hover:bg-purple-700 active:scale-95 transition-transform duration-150"
          >
            Continuar
          </button>
        </Modal>
      )}

      {showModal && status === "welcome" && (
        <Modal
          title={`Seja bem-vindo, ${username}!`}
          message="Redirecionando para o início..."
        />
      )}

      {/* Tela de loading enquanto verifica usuário */}
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-b-4 border-gray-700"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      )}
    </div>
  );
}
