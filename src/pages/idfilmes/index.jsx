import { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

export default function Assistir() {
  /* ================= FIREBASE ================= */
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

  /* ================= STATES ================= */
  const [filme, setFilme] = useState(null);
  const [media, setMedia] = useState("0.0");
  const [avaliado, setAvaliado] = useState(false);

  /* ================= CARREGAR FILME ================= */
  useEffect(() => {
    async function carregarFilme() {
      const id = new URLSearchParams(window.location.search).get("id");
      if (!id) return;

      const ref = doc(db, "filmes", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setFilme({ id, ...data });

        if (data.totalVotos) {
          setMedia((data.avaliacao / data.totalVotos).toFixed(1));
        }
      }
    }

    carregarFilme();
  }, []);

  /* ================= AVALIAR ================= */
  async function avaliar(nota) {
    if (avaliado || !filme) return;

    const ref = doc(db, "filmes", filme.id);

    await updateDoc(ref, {
      avaliacao: increment(nota),
      totalVotos: increment(1),
    });

    setAvaliado(true);
  }

  if (!filme) {
    return <div style={styles.loading}>Carregando filme...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* TOPO */}
        <div style={styles.header}>
          <img src={filme.capa} style={styles.capa} />
          <div>
            <h1 style={styles.titulo}>{filme.titulo}</h1>
            <p style={styles.media}>Nota média: {media}</p>
          </div>
        </div>

        {/* PLAYER */}
        <video src={filme.filme} controls style={styles.video} />

        {/* AVALIAÇÃO */}
        <div style={styles.avaliacaoBox}>
          <p style={styles.avaliarTexto}>Avalie este filme</p>

          <div style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                style={styles.estrela}
                onClick={() => avaliar(n)}
              >
                ☆
              </span>
            ))}
          </div>

          {avaliado && (
            <p style={styles.msg}>🎉 Obrigado pela sua avaliação!</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    background: "linear-gradient(135deg, #1f1c2c, #928dab)",
    backgroundSize: "400% 400%",
    animation: "gradientAnim 15s ease infinite",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    color: "#fff",
  },

  card: {
    width: "100%",
    maxWidth: "900px",
    background: "rgba(0,0,0,0.6)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  },

  loading: {
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
  },

  capa: {
    width: "90px",
    height: "130px",
    objectFit: "cover",
    borderRadius: "6px",
    flexShrink: 0,
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },

  titulo: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "6px",
    textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
  },

  media: {
    color: "#ccc",
    fontSize: "15px",
  },

  video: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "20px",
    background: "#000",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  },

  avaliacaoBox: {
    textAlign: "center",
    marginTop: "10px",
  },

  avaliarTexto: {
    fontSize: "16px",
    marginBottom: "12px",
    color: "#eee",
  },

  estrelas: {
    fontSize: "36px",
    letterSpacing: "6px",
    cursor: "pointer",
  },

  estrela: {
    color: "#facc15",
    transition: "all 0.3s ease",
  },

  estrelaHover: {
    transform: "translateY(-8px) scale(1.3)",
  },

  msg: {
    marginTop: "15px",
    color: "#38bdf8",
    fontSize: "16px",
    fontWeight: "600",
    animation: "fadeIn 1s ease forwards",
  },

  // Keyframes
  "@keyframes gradientAnim": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },

  "@keyframes fadeIn": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
};
