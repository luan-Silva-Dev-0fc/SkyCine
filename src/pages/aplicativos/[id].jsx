"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
};

export default function AppPage() {
  const router = useRouter();
  const { id } = router.query;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [appData, setAppData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchApp = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      let foundApp = null;

      for (const catDoc of snapshot.docs) {
        const apps = catDoc.data().apps || [];
        const match = apps.find(a => String(a.id) === String(id));
        if (match) {
          foundApp = match;
          break;
        }
      }

      if (foundApp) setAppData(foundApp);
    };

    fetchApp();
  }, [id, db]);

  const handleDownload = () => {
    if (!appData) return;

    // 🔥 DOWNLOAD IMEDIATO
    window.location.href = appData.link;

    // Modal só visual
    setIsDownloading(true);
    setStep(1);
    setTimeout(() => setStep(2), 2000);
    setTimeout(() => setStep(3), 4500);
    setTimeout(() => {
      setIsDownloading(false);
      setStep(0);
    }, 7000);
  };

  if (!appData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-400">
        Carregando dados do sistema...
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden px-4 py-10">
      {/* FUNDO */}
      <div className="absolute inset-0">
        <div className="w-full h-full animate-gradient-full bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30"></div>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative max-w-4xl mx-auto space-y-12">
        {/* CARD */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <img
              src={appData.cover}
              alt={appData.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-white/20 shadow-lg"
            />

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-white">
                {appData.name}
              </h1>

              <p className="text-gray-300 mt-1">
                App verificado • Download seguro • Plataforma protegida
              </p>

              <div className="flex justify-center sm:justify-start items-center mt-3 space-x-1">
                {[1,2,3,4,5].map(i => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i <= (appData.stars || 0)
                        ? "text-yellow-400"
                        : "text-gray-600"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-2xl shadow-lg transition"
              >
                Instalar agora
              </button>
            </div>
          </div>
        </div>

        {/* TEXTO EXTRA */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Experimente nossos aplicativos
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Downloads rápidos, proteção avançada e verificação automática de
            integridade.
          </p>
        </div>
      </div>

      {/* MODAL */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">
            <div className="space-y-6 text-center">
              {step >= 1 && (
                <p className="text-white text-xl font-semibold">
                  Aguarde alguns segundos  
                  <br />Estamos preparando seu download  
                  <br />
                  <span className="text-green-400">
                    Nossa plataforma é 100% segura
                  </span>
                </p>
              )}

              {step >= 2 && (
                <div className="bg-black/70 border border-purple-400/40 rounded-xl p-4 font-mono text-green-400 text-sm typing">
{`root@system:~$ init_download()
checking integrity...
bypass firewall...
access granted ✔`}
                </div>
              )}

              {step >= 3 && (
                <p className="text-green-400 text-2xl font-extrabold animate-pulse">
                  Download iniciado 🚀
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANIMAÇÕES */}
      <style jsx>{`
        @keyframes gradient-full {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-full {
          background-size: 200% 200%;
          animation: gradient-full 15s ease infinite;
        }

        .typing {
          animation: typing 2.5s steps(40, end);
          white-space: pre-wrap;
          overflow: hidden;
        }

        @keyframes typing {
          from { max-height: 0; }
          to { max-height: 200px; }
        }
      `}</style>
    </main>
  );
}
