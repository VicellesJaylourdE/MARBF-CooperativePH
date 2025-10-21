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
              backgroundColor: "#FCB53B",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
            About <span style={{ color: "#ffffffff" }}>MARBF Cooperative</span>
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
          Commits to serve our members and the community towards having a better standard of living.
          </p>

          <h2 style={{ fontWeight: "bold", margin: "2rem 0 1rem" }}>🌍 Our Vision</h2>
          <p style={{ maxWidth: "700px", margin: "0 auto", color: "#555" }}>
           We must for ourselves a strong and viable cooperative that can uplift its members from
poverty, expand opportunities, generate jobs and be sustainable in all our undertakings.
          </p>
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
           Our Values
          </h2>
          <p style={{ maxWidth: "700px", margin: "1rem auto", fontSize: "1rem" }}>
           to battle poverty with discipline, to create projects and livelihoods for additional family income, to give equal opportunities to our
members, to set as a good example.
          </p>
          
        </div>
         
           

        <div
          style={{
            backgroundColor: "#000000ff",
            color: "#fff",
            padding: "4rem 1rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
            Join Our Journey Towards Smarter Farming
          </h2>
          <p style={{ maxWidth: "700px", margin: "1rem auto", fontSize: "1rem" }}>
            MARBF Cooperative. is not just a system — it’s a movement to uplift
            farmers and cooperatives with digital innovation.
          </p>
          
        </div>

        <div
          style={{
            backgroundColor: "#fffdfdff",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTop: "1px solid #ccc",
          }}
        >
          <small style={{ color: "#000000ff" }}>
            © 2025 MARBF Cooperative.
            All rights reserved.
          </small>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LearnMore;
