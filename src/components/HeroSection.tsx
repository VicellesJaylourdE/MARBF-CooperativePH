import React from "react";
import { IonGrid, IonRow, IonCol, IonButton } from "@ionic/react";
import { useHistory } from "react-router-dom";

import heroImage from "../assets/tractor_3900184.png";
import "../theme/HeroSection.css";

const HeroSection: React.FC = () => {
  const history = useHistory();

  return (
    <section className="hero-section">
      <IonGrid className="hero-grid">
        <IonRow className="hero-row">

          <IonCol sizeMd="6" size="12" className="text-section">
            <h1 className="hero-title">
              Modern Equipment Booking for <span className="highlight">Agricultural Cooperatives</span>
            </h1>
            <p className="hero-subtitle">
              Streamline equipment rentals for the Mantibugao Agrarian Reform
              Beneficiaries Farmers Cooperative with our comprehensive digital
              booking system.
            </p>
            <div className="button-group">
              <IonButton color="warning" onClick={() => history.push("/")}>
                Start Booking
              </IonButton>
              <IonButton fill="outline" color="warning" onClick={() => history.push("/learnmore")}>
                Learn More
              </IonButton>
            </div>
          </IonCol>

          <IonCol sizeMd="6" size="12" className="image-section">
            <img src={heroImage} alt="Hero illustration" className="hero-image" />
          </IonCol>
        </IonRow>
      </IonGrid>
    </section>
  );
};

export default HeroSection;
