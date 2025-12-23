export default function EmBreve() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            letterSpacing: "2px",
            color: "#888",
            textTransform: "uppercase",
          }}
        >
          SkyCine
        </span>

        <h1
          style={{
            marginTop: "14px",
            fontSize: "32px",
            fontWeight: "700",
            lineHeight: "1.2",
          }}
        >
          Recurso em desenvolvimento
        </h1>

        <p
          style={{
            marginTop: "18px",
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#bdbdbd",
          }}
        >
          Este recurso ainda não está disponível no momento.
          <br />
          Estamos trabalhando para disponibilizá-lo em breve no SkyCine.
        </p>
      </div>
    </div>
  );
}
