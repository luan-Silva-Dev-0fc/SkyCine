"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

// Firebase Config
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-zinc-950 p-6 rounded-3xl w-80 border border-zinc-700 shadow-2xl transform transition-all duration-500">
        <h2 className="text-white text-2xl font-bold text-center mb-3">{title}</h2>
        <p className="text-zinc-400 text-center mb-5">{message}</p>
        {children}
      </div>
    </div>
  );
}

// Gera username automático
function gerarUsername(nome) {
  const rand = Math.floor(Math.random() * 9999);
  const tags = ["DEV", "PRO", "X", "TV", "HD"];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  const firstName = nome.split(" ")[0];
  return `${firstName}_${tag}${rand}`;
}

// Gera ID do perfil
function gerarID(nome) {
  const rand = Math.floor(Math.random() * 10000);
  const firstName = nome.split(" ")[0];
  return `${firstName.toLowerCase()}${rand}`;
}

// Funções para carregar figurinhas e gifs
const carregarColecoesComFigurinhas = async () => {
  const snap = await getDocs(collection(db, "colecoes"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      idDoc: d.id,
      nome: data.nome,
      figurinhas: data.itens?.filter((i) => i.categoria === "figurinha") || [],
      gifs: data.itens?.filter((i) => i.categoria === "gif") || [],
    };
  });
};

const carregarFigurinhas = async () => {
  const snap = await getDocs(collection(db, "colecoes"));
  const todasColecoes = snap.docs.map((d) => ({ idDoc: d.id, ...d.data() }));
  return todasColecoes.flatMap((c) => c.itens?.filter((i) => i.categoria === "figurinha") || []);
};

const carregarGifs = async () => {
  const snap = await getDocs(collection(db, "colecoes"));
  const todasColecoes = snap.docs.map((d) => ({ idDoc: d.id, ...d.data() }));
  return todasColecoes.flatMap((c) => c.itens?.filter((i) => i.categoria === "gif") || []);
};

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [username, setUsername] = useState("");
  const [idPerfil, setIdPerfil] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [status, setStatus] = useState("verificando"); // verificando, criar, final
  const [codigoAnimado, setCodigoAnimado] = useState("");
  const [colecoes, setColecoes] = useState([]);
  const [colecaoSelecionada, setColecaoSelecionada] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [orientacao, setOrientacao] = useState("");

  const router = useRouter();

  const animarCodigo = async (linhas, delay = 600) => {
    for (let i = 0; i < linhas.length; i++) {
      setCodigoAnimado(linhas[i]);
      await new Promise((res) => setTimeout(res, delay));
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
        return;
      }
      setUser(currentUser);

      await animarCodigo(["Só um segundo...", "Verificando se o perfil já existe..."], 800);

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setStatus("criar");
      } else {
        const data = snap.data();
        setUsername(data.username || "");
        setIdPerfil(data.idPerfil || "");
        setNome(data.nome || "");
        setAvatar(data.avatar || null);
        setOrientacao(data.orientacao || "");
        setStatus("final");
        await animarCodigo(["Perfil encontrado! Encaminhando para filmes..."], 500);
        setTimeout(() => router.replace("/Inicio"), 1000);
      }

      const colecoesData = await carregarColecoesComFigurinhas();
      setColecoes(colecoesData);
    });

    return () => unsub();
  }, [router]);

  const criarPerfil = async () => {
    if (!nome.trim()) return;
    const finalUsername = usernameInput || gerarUsername(nome);
    const finalID = gerarID(nome);

    setUsername(finalUsername);
    setIdPerfil(finalID);

    await animarCodigo(["Criando perfil...", "Salvando informações..."], 800);

    const dataParaSalvar = {
      nome,
      username: finalUsername,
      idPerfil: finalID,
      avatar: avatar || "",
      orientacao: orientacao || "",
      criadoEm: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), dataParaSalvar, { merge: true });

    setStatus("final");
    await animarCodigo(["Perfil criado com sucesso!"], 600);
    setTimeout(() => router.replace("/Inicio"), 1000);
  };

  const itensAvatar = [
    ...(colecaoSelecionada?.figurinhas || []),
    ...(colecaoSelecionada?.gifs || []),
  ];

  const orientacoes = ["Heterossexual", "Homossexual", "Bissexual", "Pansexual", "Assexual", "Outro"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-800 flex flex-col items-center justify-center text-white p-4">
      {showModal && (
        <Modal
          title={
            status === "verificando"
              ? "Verificando perfil"
              : status === "criar"
              ? "Crie seu perfil"
              : "Status"
          }
          message={codigoAnimado}
        >
          {status === "criar" && (
            <div className="flex flex-col gap-3">
              <input
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none"
              />
              <div className="flex gap-2 items-center">
                <input
                  placeholder="Nome de usuário (opcional)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-2xl bg-zinc-800 text-white outline-none"
                />
                <button
                  onClick={() => setUsernameInput(gerarUsername(nome))}
                  className="px-3 py-2 bg-purple-600 rounded-xl"
                >
                  Gerar
                </button>
              </div>
              <select
                value={orientacao}
                onChange={(e) => setOrientacao(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl bg-zinc-800 text-white"
              >
                <option value="">Selecione orientação sexual</option>
                {orientacoes.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <select
                onChange={(e) => setColecaoSelecionada(colecoes.find(c => c.idDoc === e.target.value))}
                className="w-full px-4 py-2 rounded-2xl bg-zinc-800 text-white"
              >
                <option value="">Selecione coleção de avatar</option>
                {colecoes.map(c => (
                  <option key={c.idDoc} value={c.idDoc}>{c.nome}</option>
                ))}
              </select>

              {colecaoSelecionada && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {itensAvatar.map(f => (
                    <div
                      key={f.id}
                      className={`w-16 h-16 rounded-full border-4 cursor-pointer ${avatar === f.id ? 'border-green-500' : 'border-gray-600'}`}
                      onClick={() => setAvatar(f.id)}
                      style={{ backgroundImage: `url(${f.link})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={criarPerfil}
                className="mt-4 w-full bg-purple-600 py-2 rounded-2xl font-semibold hover:bg-purple-700"
              >
                Salvar todas as informações
              </button>
            </div>
          )}
        </Modal>
      )}

      {status === "verificando" && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-b-4 border-gray-700"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      )}
    </div>
  );
}
