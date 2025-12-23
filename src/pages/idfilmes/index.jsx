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

  const [filme, setFilme] = useState(null);
  const [media, setMedia] = useState("0.0");
  const [avaliado, setAvaliado] = useState(false);

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
    return <div style={styles.loading}>Carregando conteúdo...</div>;
  }

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.hero,
          backgroundImage: `url(${filme.capa})`,
        }}
      >
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{filme.titulo}</h1>
          <p style={styles.heroSubtitle}>
            Avaliação média {media}
          </p>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.infoBox}>
          <img src={filme.capa} style={styles.poster} />

          <div style={styles.details}>
            <h2 style={styles.title}>{filme.titulo}</h2>

            <p style={styles.description}>
              Assista a este título em alta qualidade, com reprodução fluida e
              interface focada na experiência do usuário.
            </p>

            <div style={styles.meta}>
              <span>Alta definição</span>
              <span>Streaming contínuo</span>
              <span>Disponível agora</span>
            </div>

            <p style={styles.rating}>
              Nota média dos usuários: <strong>{media}</strong>
            </p>
          </div>
        </div>

        <video src={filme.filme} controls style={styles.video} />

        <div style={styles.avaliacaoBox}>
          <h3 style={styles.avaliarTitulo}>Avaliação</h3>
          <p style={styles.avaliarTexto}>
            Sua opinião contribui para a qualidade da plataforma.
          </p>

          <div style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                style={styles.estrela}
                onClick={() => avaliar(n)}
              >
                ★
              </span>
            ))}
          </div>

          {avaliado && (
            <p style={styles.msg}>Avaliação registrada com sucesso.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    fontSize: "18px",
  },

  hero: {
    height: "320px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(15,23,42,1), rgba(15,23,42,0.6))",
  },

  heroContent: {
    position: "absolute",
    bottom: "30px",
    left: "30px",
  },

  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
  },

  heroSubtitle: {
    fontSize: "15px",
    color: "#cbd5f5",
  },

  content: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px 20px",
  },

  infoBox: {
    display: "flex",
    gap: "24px",
    marginBottom: "30px",
  },

  poster: {
    width: "160px",
    borderRadius: "10px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
  },

  details: {
    flex: 1,
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "10px",
  },

  description: {
    fontSize: "15px",
    color: "#cbd5f5",
    lineHeight: "1.6",
    marginBottom: "14px",
  },

  meta: {
    display: "flex",
    gap: "14px",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "12px",
  },

  rating: {
    fontSize: "15px",
    color: "#e5e7eb",
  },

  video: {
    width: "100%",
    borderRadius: "14px",
    background: "#000",
    marginBottom: "30px",
  },

  avaliacaoBox: {
    textAlign: "center",
    padding: "25px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "14px",
  },

  avaliarTitulo: {
    fontSize: "20px",
    marginBottom: "6px",
  },

  avaliarTexto: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "14px",
  },

  estrelas: {
    fontSize: "34px",
    letterSpacing: "6px",
    cursor: "pointer",
  },

  estrela: {
    color: "#facc15",
    transition: "transform 0.25s ease",
  },

  msg: {
    marginTop: "12px",
    color: "#38bdf8",
    fontSize: "14px",
  },
};
