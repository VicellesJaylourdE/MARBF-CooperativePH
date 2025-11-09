// src/components/CTASection.tsx
import React from "react";
import "../theme/CTASection.css";
import { IonButton } from "@ionic/react";
import { useHistory } from "react-router-dom";

const CTASection: React.FC = () => {
  const history = useHistory();

  return (
    <div className="cta-section" style={{ textAlign: "center", padding: "4rem 1rem", backgroundColor: "#FCB53B", color: "#fff" }}>
      <h2 style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
        Ready to Modernize Your Equipment Management?
      </h2>
      <p style={{ maxWidth: "700px", margin: "1rem auto", fontSize: "1rem" }}>
        Join the Mantibugao Agrarian Reform Beneficiaries Farmers Cooperative in embracing digital transformation for better agricultural outcomes.
      </p>
      <IonButton color="light" onClick={() => history.push("/registerone")}>
        Register
      </IonButton>
    </div>
  );
};

export default CTASection;
