"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, deleteUser } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Firebase config
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

// Modal de animação de código
function Modal({ message }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-zinc-950 p-6 rounded-3xl w-80 border border-zinc-700 shadow-2xl font-mono text-green-400">
        <p>{message}</p>
      </div>
    </div>
  );
}

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({
    nome: "",
    username: "",
    avatar: "",
    orientacao: "",
    biografia: "",
    idPerfil: "",
    criadoEm: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [codigoAnimado, setCodigoAnimado] = useState("");

  const animarCodigo = async (linhas = [], delay = 400) => {
    for (let i = 0; i < linhas.length; i++) {
      setCodigoAnimado(linhas[i]);
      setShowModal(true);
      await new Promise((res) => setTimeout(res, delay));
    }
    setShowModal(false);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
        return;
      }
      setUser(currentUser);

      await animarCodigo([
        "Verificando se o perfil já foi criado...",
        "Carregando informações do usuário..."
      ], 600);

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPerfil({
          nome: data.nome || "",
          username: data.username || "",
          avatar: data.avatar || "https://s3.getstickerpack.com/storage/uploads/sticker-pack/shitpost-gifs/sticker_26.gif?e435dc30efb23e40bd62417271e319c9&d=200x200",
          orientacao: data.orientacao || "",
          biografia: data.biografia || "",
          idPerfil: data.idPerfil || "",
          criadoEm: data.criadoEm || "",
        });
      }
    });

    return () => unsub();
  }, [router]);

  const handleChange = async (field, value) => {
    setPerfil((prev) => ({ ...prev, [field]: value }));
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { [field]: value }, { merge: true });
    animarCodigo([`Atualizando ${field}...`], 300);
  };

  const deletarConta = async () => {
    if (!user) return;
    await animarCodigo(["Deletando conta...", "Removendo dados do Firebase..."], 500);
    try {
      await setDoc(doc(db, "users", user.uid), {}, { merge: true });
      await deleteUser(user);
      router.replace("/");
    } catch (err) {
      console.error("Erro ao deletar conta:", err);
      animarCodigo(["Erro ao deletar conta"], 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      {showModal && <Modal message={codigoAnimado} />}

      <div className="flex flex-col items-center gap-4">
        {/* Bolinha do perfil */}
        <div
          className="w-24 h-24 rounded-full border-4 border-purple-600"
          style={{
            backgroundImage: perfil.avatar ? `url(${perfil.avatar})` : "",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <input
          placeholder="Nome"
          value={perfil.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          className="w-64 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none"
        />
        <input
          placeholder="Nome de usuário"
          value={perfil.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className="w-64 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none"
        />
        <input
          placeholder="Biografia"
          value={perfil.biografia}
          onChange={(e) => handleChange("biografia", e.target.value)}
          className="w-64 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none"
        />
        <input
          placeholder="Orientação sexual"
          value={perfil.orientacao}
          onChange={(e) => handleChange("orientacao", e.target.value)}
          className="w-64 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none"
        />
        <input
          placeholder="ID do perfil"
          value={perfil.idPerfil}
          disabled
          className="w-64 px-4 py-2 rounded-2xl bg-gray-700 text-white cursor-not-allowed"
        />
        <input
          placeholder="Criado em"
          value={perfil.criadoEm}
          disabled
          className="w-64 px-4 py-2 rounded-2xl bg-gray-700 text-white cursor-not-allowed"
        />

        {/* Botão deletar conta */}
        <button
          onClick={deletarConta}
          className="mt-4 w-64 bg-red-600 py-2 rounded-2xl font-semibold hover:bg-red-700"
        >
          Deletar Conta
        </button>
      </div>
    </div>
  );
}
