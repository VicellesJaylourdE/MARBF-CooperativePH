import React from "react";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const LearnMore: React.FC = () => {
  const history = useHistory();

  // Detect system dark mode gamit prefers-color-scheme
  const isDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <IonPage>
      <IonToolbar color="light">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 1rem",
          }}
        >
          {/* 🚜 MARBF Cooperative dynamic color */}
          <IonButton
            fill="clear"
            style={{
              fontWeight: "bold",
              fontSize: "1.05rem",
              color: isDark ? "white" : "black",
            }}
            onClick={() => history.push("/")}
          >
            🚜 MARBF Cooperative.
          </IonButton>
        </div>
      </IonToolbar>

      <IonContent className="ion-padding" fullscreen>
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            backgroundColor: "#f5f0e6",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
            About <span style={{ color: "#FCB53B" }}>MARBF Cooperative</span>
          </h1>
          <p style={{ fontSize: "1rem", marginTop: "1rem", color: "#555" }}>
            A digital initiative by the Mantibugao Agrarian Reform Beneficiaries
            Farmers Cooperative, empowering farmers with modern tools for
            equipment booking and cooperative management.
          </p>
        </div>

        <div style={{ padding: "2rem 1rem", textAlign: "center" }}>
          <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>🌱 Our Mission</h2>
          <p style={{ maxWidth: "700px", margin: "0 auto", color: "#555" }}>
            To simplify and modernize the way agricultural cooperatives manage
            resources, ensuring farmers have fair, timely, and efficient access
            to equipment that drives productivity and prosperity.
          </p>

          <h2 style={{ fontWeight: "bold", margin: "2rem 0 1rem" }}>🌍 Our Vision</h2>
          <p style={{ maxWidth: "700px", margin: "0 auto", color: "#555" }}>
            A sustainable and digitally empowered farming community where
            technology bridges the gap between tradition and innovation.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#eef6ed",
            padding: "3rem 1rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontWeight: "bold", marginBottom: "1.5rem" }}>💚 Core Values</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {[
              { title: "Unity", desc: "Strengthening cooperatives through collective effort." },
              { title: "Innovation", desc: "Embracing technology for smarter farming." },
              { title: "Sustainability", desc: "Building systems that protect future generations." },
              { title: "Empowerment", desc: "Giving farmers access to modern tools and knowledge." },
            ].map((value, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  backgroundColor: "#fff",
                }}
              >
                <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#555" }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FCB53B",
            color: "#fff",
            padding: "4rem 1rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
            Join Our Journey Towards Smarter Farming 🚀
          </h2>
          <p style={{ maxWidth: "700px", margin: "1rem auto", fontSize: "1rem" }}>
            MARBF Cooperative. is not just a system — it’s a movement to uplift
            farmers and cooperatives with digital innovation.
          </p>
          <IonButton
            style={{
              marginTop: "1.5rem",
              padding: "0.8rem 2rem",
              fontSize: "1rem",
              borderRadius: "8px",
            }}
            color="light"
            onClick={() => history.push("/register")}
          >
            Get Started Today →
          </IonButton>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTop: "1px solid #ccc",
          }}
        >
          <small style={{ color: "#666" }}>
            © 2025 MARBF Cooperative.
            All rights reserved.
          </small>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LearnMore;
