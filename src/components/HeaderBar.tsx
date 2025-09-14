import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
} from "@ionic/react";
import {
  contractOutline,
  settingsOutline,
  personCircleOutline,
  logOutOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

const HeaderBar: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar color="light">
      
        <IonTitle className="logo">
          <IonIcon icon={contractOutline} style={{ marginRight: "8px" }} />
          Coop PaBOOKid
        </IonTitle>

    
        <div style={{ position: "absolute", right: "1rem", top: "0.5rem" }}>
          <IonButton routerLink="/settings" fill="clear">
            <IonIcon icon={settingsOutline} />
          </IonButton>

          <IonButton routerLink="/profile" fill="clear">
            <IonIcon icon={personCircleOutline} />
          </IonButton>

          <IonButton
            fill="clear"
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error("Logout error:", error.message);
              } else {
                window.location.href = "/MARBF-CooperativePH";
              }
            }}
          >
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default HeaderBar;
