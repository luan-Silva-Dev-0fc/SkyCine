"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Sugestoes() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, action: null });

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

  const showModal = (message, type = "info") =>
    setModal({ show: true, message, type });
  const closeModal = () => setModal({ ...modal, show: false });

  const carregarSugestoes = async (uid) => {
    const q = query(collection(db, "feedback"), where("uid", "==", uid));
    const querySnap = await getDocs(q);
    const data = querySnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    setSugestoes(data);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);

        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDocs(
          query(collection(db, "users"), where("uid", "==", currentUser.uid))
        );
        if (!snap.empty) setUserName(snap.docs[0].data().username);

        carregarSugestoes(currentUser.uid);
      }
    });
    return () => unsub();
  }, []);

  const handleEdit = (sug) => {
    if (sug.uid !== userId) {
      showModal("Você só pode editar suas próprias sugestões.", "error");
      return;
    }
    setEditId(sug.id);
    setEditText(sug.conteudo);
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      showModal("O conteúdo não pode estar vazio.", "error");
      return;
    }
    const ref = doc(db, "feedback", editId);
    await updateDoc(ref, { conteudo: editText });
    setEditId(null);
    setEditText("");
    carregarSugestoes(userId);
    showModal("Sugestão editada com sucesso!", "success");
  };

  const handleDeleteConfirm = (sug) => {
    if (sug.uid !== userId) {
      showModal("Você só pode excluir suas próprias sugestões.", "error");
      return;
    }
    setConfirmDelete({ show: true, action: () => handleDelete(sug.id) });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "feedback", id));
    carregarSugestoes(userId);
    showModal("Sugestão excluída com sucesso!", "success");
    setConfirmDelete({ show: false, action: null });
  };

  const cancelDelete = () => setConfirmDelete({ show: false, action: null });

  return (
    <div className="relative min-h-screen bg-gray-900 text-white px-4 sm:px-10 py-10 flex flex-col items-center">
      
      {/* Imagem horizontal no topo */}
      <div className="w-full max-w-6xl mb-10 relative rounded-3xl overflow-hidden shadow-lg">
        <img
          src="https://m.media-amazon.com/images/S/pv-target-images/33d554c8ea607e6dd5f01767fd0d7053954de54efa315100c2ed16650253f019.jpg"
          alt="banner horizontal"
          className="w-full h-64 sm:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div> {/* camada escura sobre a imagem */}
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Minhas Sugestões</h1>

      {sugestoes.length === 0 && (
        <p className="text-gray-400 mb-6">Você ainda não enviou sugestões.</p>
      )}

      <div className="w-full max-w-4xl flex flex-col gap-6">
        {sugestoes.map((sug) => (
          <div
            key={sug.id}
            className="bg-gray-800/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xl transition-shadow"
          >
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-gray-700/50 text-sm px-3 py-1 rounded-full font-medium">
                  {sug.username}
                </span>
                <span className="bg-gray-700/40 text-xs px-2 py-1 rounded-full">
                  {sug.tipo}
                </span>
              </div>
              {editId === sug.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    className="px-4 py-2 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-colors self-start"
                    onClick={saveEdit}
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <p className="text-white/90 mt-2">{sug.conteudo}</p>
              )}
            </div>

            {editId !== sug.id && (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors font-semibold"
                  onClick={() => handleEdit(sug)}
                >
                  Editar
                </button>
                <button
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  onClick={() => handleDeleteConfirm(sug)}
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-80 text-center flex flex-col gap-4 shadow-xl">
            <p
              className={`font-semibold text-lg ${
                modal.type === "success"
                  ? "text-green-400"
                  : modal.type === "error"
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
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
                onClick={confirmDelete.action}
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
