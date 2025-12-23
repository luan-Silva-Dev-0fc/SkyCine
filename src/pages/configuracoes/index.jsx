"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

export default function Configuracoes() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      setUserData({
        email: user.email,
        username: snap.exists() ? snap.data().username : "Não definido",
      });
    });

    return () => unsub();
  }, [router]);

  const sairDaConta = async () => {
    await signOut(auth);
    router.replace("/");
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h1 className="text-2xl font-bold mb-8">Configurações</h1>

        <div className="space-y-6">
          <div>
            <span className="text-sm text-zinc-400">Usuário</span>
            <p className="text-lg font-medium">{userData.username}</p>
          </div>

          <div>
            <span className="text-sm text-zinc-400">Email</span>
            <p className="text-lg font-medium">{userData.email}</p>
          </div>

          <button
            onClick={sairDaConta}
            className="w-full mt-10 py-3 rounded-xl border border-zinc-700 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
