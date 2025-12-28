"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
  storageBucket: "skycine-c59b0.firebasestorage.app",
  messagingSenderId: "1084857538934",
  appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  measurementId: "G-04C59E452Z"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function HackStore() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        apps: (doc.data().apps || []).map(app => ({
          ...app,
          appId: app.appId || app.id || `${doc.id}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const lastShown = localStorage.getItem("hackstore_notice_time");
    const now = Date.now();
    if (!lastShown || now - Number(lastShown) > 60 * 60 * 1000) {
      setShowModal(true);
      localStorage.setItem("hackstore_notice_time", now.toString());
    }
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden px-6 py-10">
      <div className="absolute inset-0">
        <div className="w-full h-full animate-gradient-full bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30"></div>
        <div className="absolute inset-0 bg-gray-900/60"></div>
      </div>

      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 left-6 z-50 text-white text-4xl font-bold hover:scale-110 transition"
      >
        ☰
      </button>

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl z-50 transform transition-transform duration-500 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-green-400">Categorias</h3>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white text-3xl hover:rotate-90 transition"
          >
            ✖
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {categories.map(category => (
            <div key={category.id}>
              <h4 className="text-green-400 font-semibold mb-2">
                {category.name}
              </h4>
              <ul className="space-y-1 text-gray-300 text-sm ml-3">
                {category.apps.map(app => (
                  <Link
                    key={app.appId}
                    href={`/aplicativos/${app.appId}`}
                    onClick={() => setMenuOpen(false)}
                    className="block hover:text-white transition"
                  >
                    {app.name}
                  </Link>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40"
        ></div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/20 rounded-3xl p-8 max-w-md text-center shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-green-400 mb-4">
              🚀 Novidades a caminho!
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              A HackStore está em constante evolução. Estamos adicionando novos
              aplicativos, jogos e ferramentas para oferecer uma experiência
              cada vez mais completa. Em breve, você encontrará inúmeras opções
              incríveis por aqui. Acompanhe as novidades!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-xl transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto z-10">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-3 space-x-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5773/5773759.png"
              alt="HackStore Icon"
              className="w-14 h-14 animate-bounce"
            />
            <h1 className="text-5xl font-extrabold text-green-400 tracking-wide drop-shadow-lg">
              HackStore
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Explore aplicativos incríveis, descubra novos jogos, filmes e
            ferramentas — tudo em uma interface moderna e responsiva.
          </p>
        </header>

        <div className="space-y-16">
          {categories.map(category => (
            <section key={category.id}>
              <h2 className="text-3xl font-bold text-green-400 mb-6 border-b-2 border-green-500 inline-block pb-1">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {category.apps.map(app => (
                  <Link key={app.appId} href={`/aplicativos/${app.appId}`}>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer">
                      <div className="overflow-hidden rounded-2xl mb-4 border border-white/20 shadow-lg">
                        <img
                          src={app.cover || "/covers/default.jpg"}
                          alt={app.name}
                          className="w-full h-44 object-cover transform transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">
                        {app.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        Categoria: {category.name}
                      </p>
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span
                            key={i}
                            className={`text-sm mr-1 ${
                              i <= (app.stars || 0)
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="inline-block w-full text-center bg-green-500 px-4 py-2 rounded-xl font-bold text-black hover:bg-green-400 transition">
                        Abrir
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-full {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-full {
          background-size: 200% 200%;
          animation: gradient-full 15s ease infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </main>
  );
}
