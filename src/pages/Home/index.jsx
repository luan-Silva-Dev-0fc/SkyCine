"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

function Modal({ title, message, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-950 p-6 rounded-3xl w-80 border border-zinc-700 shadow-xl">
        <h2 className="text-white text-xl font-bold text-center mb-3">{title}</h2>
        <p className="text-zinc-400 text-center mb-5">{message}</p>
        {children}
      </div>
    </div>
  );
}

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
        setStatus("redirect");
        setShowModal(true);
        setTimeout(() => router.replace("/Inicio"), 1200);
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

    setStatus("redirect");
    setTimeout(() => router.replace("/Inicio"), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-800 flex items-center justify-center text-white">
      {showModal && status === "create" && (
        <Modal
          title="Criar nome de usuário"
          message="Escolha um nome. Um ID exclusivo será gerado automaticamente."
        >
          <input
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Digite seu nome"
            className="w-full mb-4 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <button
            onClick={criarUsername}
            className="w-full bg-purple-600 py-2 rounded-2xl font-semibold hover:bg-purple-700 transition"
          >
            Continuar
          </button>
        </Modal>
      )}

      {showModal && status === "redirect" && (
        <Modal
          title="Pronto"
          message="Usuário identificado. Redirecionando..."
        />
      )}
    </div>
  );
}
