"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function SugestoesEnviar() {
  const [selectedType, setSelectedType] = useState("");
  const [inputText, setInputText] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, action: null });
  const router = useRouter();

  const firebaseConfig = {
    apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
    authDomain: "skycine-c59b0.firebaseapp.com",
    projectId: "skycine-c59b0",
    storageBucket: "skycine-c59b0.firebasestorage.app",
    messagingSenderId: "1084857538934",
    appId: "1:1084857538934:web:8cda5903b8e7ef74b4c257",
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);

        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setUserName(snap.data().username);
      }
    });
    return () => unsub();
  }, []);

  const showModal = (message, type = "info") => setModal({ show: true, message, type });
  const closeModal = () => setModal({ ...modal, show: false });

  const handleSubmit = async () => {
    if (!selectedType || !inputText) {
      showModal("Escolha o tipo de sugestão e escreva algo!", "error");
      return;
    }
    try {
      await addDoc(collection(db, "feedback"), {
        uid: userId,
        username: userName,
        tipo: selectedType,
        conteudo: inputText,
        createdAt: new Date(),
      });
      showModal("Sugestão enviada com sucesso!", "success");
      setInputText("");
      setSelectedType("");
    } catch (err) {
      console.error(err);
      showModal("Erro ao enviar sugestão.", "error");
    }
  };

  const handleDeleteConfirm = (action) => {
    setConfirmDelete({ show: true, action });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete.action) confirmDelete.action();
    setConfirmDelete({ show: false, action: null });
  };

  const cancelDelete = () => setConfirmDelete({ show: false, action: null });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 sm:px-10 py-10">
      
      {/* Foto horizontal com fundo embaçado */}
      <div className="relative w-full flex justify-center mb-8">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-b-3xl"></div>
        <img
          src="https://m.media-amazon.com/images/S/pv-target-images/33d554c8ea607e6dd5f01767fd0d7053954de54efa315100c2ed16650253f019.jpg"
          alt="banner horizontal"
          className="w-full max-w-5xl h-60 sm:h-80 object-cover rounded-b-3xl shadow-lg relative z-10"
        />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Envie suas sugestões</h1>

      {/* Botões de tipo de sugestão */}
      <div className="flex flex-wrap gap-6 justify-center mb-8">
        {["Interface do site", "Filmes", "Votação"].map((tipo) => (
          <button
            key={tipo}
            className={`px-6 py-3 rounded-xl shadow-lg text-white text-lg font-semibold transition-transform ${
              selectedType === tipo ? "bg-gray-700 scale-105" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setSelectedType(tipo)}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Formulário de sugestão */}
      {selectedType && (
        <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4 mb-8">
          <label className="text-lg font-medium">
            {selectedType === "Interface do site" &&
              "O que você acha que precisa melhorar no layout?"}
            {selectedType === "Filmes" &&
              "Qual filme você gostaria de ver no SkyCine?"}
            {selectedType === "Votação" &&
              "Sugira sua votação ou escolha de filmes:"}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none"
            placeholder="Escreva aqui..."
          />
          <button
            className="self-end px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
            onClick={handleSubmit}
          >
            Enviar
          </button>
        </div>
      )}

      {/* Botão para ver todas as sugestões */}
      <button
        className="px-6 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors shadow-lg mb-8"
        onClick={() => router.push("/sugestoes")}
      >
        Ver todas as sugestões dos usuários
      </button>

   

      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-80 text-center flex flex-col gap-4 shadow-xl">
            <p className={`font-semibold text-lg ${modal.type === "success" ? "text-green-400" : modal.type === "error" ? "text-red-400" : "text-white"}`}>
              {modal.message}
            </p>
            <button
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              onClick={closeModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-80 text-center flex flex-col gap-4 shadow-xl">
            <p className="font-semibold text-lg text-white">
              Tem certeza que deseja excluir esta sugestão?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors font-semibold"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                onClick={confirmDeleteAction}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
