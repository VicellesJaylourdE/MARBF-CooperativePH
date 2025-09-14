import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from "@ionic/react";
import { contractOutline, settingsOutline, personCircleOutline, logOutOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

const HeaderBar: React.FC = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <IonHeader>
      <IonToolbar color="light">
        <IonTitle className="logo">
          <IonIcon icon={contractOutline} style={{ marginRight: "8px" }} />
          Coop PaBOOKid
        </IonTitle>
        <IonButtons slot="end">
          <IonButton>Jay</IonButton>
          <IonButton>
            <IonIcon icon={settingsOutline} />
          </IonButton>
          <IonButton>
            <IonIcon icon={personCircleOutline} />
          </IonButton>
          <IonButton color="warning" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default HeaderBar;
