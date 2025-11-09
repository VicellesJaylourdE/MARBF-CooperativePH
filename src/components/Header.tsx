import React from "react";
import { IonToolbar, IonTitle, IonButton, IonMenuButton } from "@ionic/react";
import { useHistory } from "react-router-dom";

// Define the props type
interface HeaderProps {
  scrollToAbout: () => void;
  scrollToContact: () => void;
}

const Header: React.FC<HeaderProps> = ({ scrollToAbout, scrollToContact }) => {
  const history = useHistory();

  return (
    <IonToolbar color="light">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem" }}>
        <IonTitle style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Coop PaBOOKid</IonTitle>

        <div className="ion-hide-sm-down">
          <IonButton fill="clear" onClick={() => history.push("/Landingpage")} color="warning">Home</IonButton>
          <IonButton fill="clear" onClick={scrollToAbout} color="warning">About Us</IonButton>
          <IonButton fill="clear" onClick={scrollToContact} color="warning">Contact</IonButton>
          <IonButton color="warning" onClick={() => history.push("/login")}>Sign In</IonButton>
        </div>

        <div className="ion-hide-md-up">
          <IonMenuButton slot="end" autoHide={false} />
        </div>
      </div>
    </IonToolbar>
  );
};

export default Header;
