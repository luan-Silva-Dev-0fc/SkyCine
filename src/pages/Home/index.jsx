"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

/* ================= FIREBASE ================= */

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

/* ================= HELPERS ================= */

const gerarUsername = (nome) => {
  const rand = Math.floor(Math.random() * 9999);
  return `${nome.split(" ")[0]}_${rand}`;
};

const gerarID = (nome) => {
  const rand = Math.floor(Math.random() * 9999);
  return `${nome.split(" ")[0].toLowerCase()}${rand}`;
};

const carregarColecoes = async () => {
  const snap = await getDocs(collection(db, "colecoes"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

/* ================= COMPONENTES ================= */

function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-950 w-full max-w-md p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

/* ================= MAIN ================= */

export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);

  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  const [colecoes, setColecoes] = useState([]);
  const [abrirAvatarPicker, setAbrirAvatarPicker] = useState(false);

  /* ========== AUTH CHECK ========== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/");
        return;
      }

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        router.replace("/Inicio");
        return;
      }

      setUser(u);
      const data = await carregarColecoes();
      setColecoes(data);
    });

    return () => unsub();
  }, [router]);

  /* ========== SAVE PROFILE ========== */
  const salvarPerfil = async () => {
    await setDoc(doc(db, "users", user.uid), {
      nome,
      username: username || gerarUsername(nome),
      idPerfil: gerarID(nome),
      avatar,
      criadoEm: new Date(),
    });

    router.replace("/Inicio");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4 text-white">
      <Modal>

        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <>
            <StepHeader
              title="Crie seu perfil"
              subtitle="Informe seus dados básicos"
            />

            <input
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-xl bg-zinc-800 outline-none"
            />

            <input
              placeholder="Username (opcional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-zinc-800 outline-none"
            />

            <button
              onClick={() => nome && setStep(2)}
              className="mt-5 w-full bg-purple-600 py-2 rounded-xl font-semibold"
            >
              Continuar
            </button>
          </>
        )}

        {/* ===== STEP 2 ===== */}
        {step === 2 && (
          <>
            <StepHeader
              title="Seu avatar"
              subtitle="Escolha uma figurinha ou gif"
            />

            <div className="flex justify-center mb-6 relative">
              <div
                className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-purple-600"
                style={{
                  backgroundImage: avatar ? `url(${avatar})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <button
                onClick={() => setAbrirAvatarPicker(true)}
                className="absolute bottom-0 right-[calc(50%-12px)] translate-x-12 w-8 h-8 rounded-full bg-purple-600 text-xl flex items-center justify-center"
              >
                +
              </button>
            </div>

            <button
              onClick={salvarPerfil}
              className="w-full bg-purple-600 py-2 rounded-xl font-semibold"
            >
              Finalizar perfil
            </button>
          </>
        )}
      </Modal>

      {/* ===== AVATAR PICKER ===== */}
      {abrirAvatarPicker && (
        <Modal>
          <StepHeader
            title="Escolha seu avatar"
            subtitle="Figurinhas e gifs disponíveis"
          />

          <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto">
            {colecoes.flatMap((c) =>
              c.itens?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setAvatar(item.link);
                    setAbrirAvatarPicker(false);
                  }}
                  className="w-16 h-16 rounded-full border-2 border-zinc-600 cursor-pointer hover:border-purple-500 transition"
                  style={{
                    backgroundImage: `url(${item.link})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))
            )}
          </div>

          <button
            onClick={() => setAbrirAvatarPicker(false)}
            className="mt-4 w-full bg-zinc-800 py-2 rounded-xl"
          >
            Cancelar
          </button>
        </Modal>
      )}
    </div>
  );
}
