"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function SugestoesEnviar() {
  const [selectedType, setSelectedType] = useState("");
  const [inputText, setInputText] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "info" });
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
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

  // Enviar sugestão (Interface ou Filme) para a coleção 'comments'
  const handleSubmit = async () => {
    if (!selectedType || !inputText) {
      showModal("Escolha o tipo de sugestão e escreva algo!", "error");
      return;
    }
    try {
      await addDoc(collection(db, "comments"), {
        uid: userId,
        username: userName,
        tipo: selectedType,
        conteudo: inputText,
        createdAt: new Date(),
      });
      showModal("Sugestão enviada com sucesso!", "success");
      setInputText("");
      setSelectedType("");
      fetchComments();
    } catch (err) {
      console.error(err);
      showModal("Erro ao enviar sugestão.", "error");
    }
  };

  // Enviar comentário normal
  const handleCommentSubmit = async () => {
    if (!commentInput) {
      showModal("Escreva algo no comentário!", "error");
      return;
    }
    try {
      await addDoc(collection(db, "comments"), {
        uid: userId,
        username: userName,
        tipo: "Comentário",
        conteudo: commentInput,
        createdAt: new Date(),
      });
      setCommentInput("");
      showModal("Comentário enviado!", "success");
      fetchComments();
    } catch (err) {
      console.error(err);
      showModal("Erro ao enviar comentário.", "error");
    }
  };

  const fetchComments = async () => {
    let commentsQuery = collection(db, "comments");

    if (searchUsername) {
      commentsQuery = query(commentsQuery, where("username", "==", searchUsername));
    }

    const snapshot = await getDocs(commentsQuery);
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

    setComments(data);
  };

  const handleDelete = async (comment) => {
    if (comment.uid !== userId) {
      showModal("Você não tem autorização para excluir os comentários dos outros", "error");
      return;
    }
    try {
      await deleteDoc(doc(db, "comments", comment.id));
      fetchComments();
      showModal("Comentário excluído com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showModal("Erro ao excluir comentário.", "error");
    }
  };

  const startEdit = (comment) => {
    if (comment.uid !== userId) {
      showModal("Você não tem autorização para editar os comentários dos outros", "error");
      return;
    }
    setEditingId(comment.id);
    setEditingText(comment.conteudo);
  };

  const saveEdit = async (id) => {
    if (!editingText) return;
    try {
      await updateDoc(doc(db, "comments", id), { conteudo: editingText });
      setEditingId(null);
      setEditingText("");
      fetchComments();
      showModal("Comentário editado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showModal("Erro ao editar comentário.", "error");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [searchUsername]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 sm:px-10 py-10 gap-8">
      
      {/* Banner */}
      <div className="relative w-full max-w-5xl flex justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-b-3xl"></div>
        <img
          src="https://m.media-amazon.com/images/S/pv-target-images/33d554c8ea607e6dd5f01767fd0d7053954de54efa315100c2ed16650253f019.jpg"
          alt="banner"
          className="w-full h-60 sm:h-80 object-cover rounded-b-3xl shadow-lg relative z-10"
        />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-center">Envie suas sugestões</h1>

      {/* Tipos de sugestão */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {["Interface do site", "Filmes"].map((tipo) => (
          <button
            key={tipo}
            className={`px-5 py-3 rounded-xl font-semibold transition-transform ${
              selectedType === tipo
                ? "bg-gray-700 scale-105 shadow-lg"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setSelectedType(tipo)}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Formulário de sugestão */}
      {selectedType && (
        <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4">
          <label className="text-lg font-medium">
            {selectedType === "Interface do site" &&
              "O que você acha que precisa melhorar no layout?"}
            {selectedType === "Filmes" &&
              "Qual filme você gostaria de ver no SkyCine?"}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600 resize-none transition-all"
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

      {/* Comentário */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        <label className="text-lg font-medium">Deixe um comentário:</label>
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          rows={3}
          className="w-full p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600 resize-none transition-all"
          placeholder="Digite seu comentário..."
        />
        <button
          className="self-end px-6 py-2 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
          onClick={handleCommentSubmit}
        >
          Enviar comentário
        </button>
      </div>

      {/* Buscar por username */}
      <div className="w-full max-w-3xl flex flex-col gap-2">
        <input
          type="text"
          placeholder="Digite o username para filtrar"
          className="w-full p-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
      </div>

      {/* Lista de comentários e sugestões */}
      <div className="w-full max-w-3xl flex flex-col gap-3 mt-4">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center">Nenhum comentário encontrado.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-gray-700 p-4 rounded-xl shadow-md flex flex-col gap-2">
              <p className="font-semibold">{c.username}</p>
              <p className="italic text-sm text-gray-300">{c.tipo}</p>

              {editingId === c.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    className="w-full p-2 rounded-xl bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  />
                  <button
                    className="px-4 py-2 bg-green-600 rounded-xl hover:bg-green-700 transition-colors font-semibold self-end"
                    onClick={() => saveEdit(c.id)}
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <p>{c.conteudo}</p>
              )}

              {/* Botões de ação só para o dono */}
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-600 rounded-lg hover:bg-yellow-700 text-sm"
                  onClick={() => startEdit(c)}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 text-sm"
                  onClick={() => handleDelete(c)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
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
    </div>
  );
}
