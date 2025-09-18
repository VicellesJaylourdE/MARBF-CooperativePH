import React from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import {
  homeOutline,
  calendarOutline,
  informationCircleOutline,
  callOutline,
  logInOutline,
} from "ionicons/icons";

const RightSideMenu: React.FC = () => {
  return (
    <IonMenu
      side="end"
      contentId="main"
      type="overlay"
      className="ion-hide-md-up custom-right-menu"
    >
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle style={{ fontWeight: "", color: "white" }}>
            Menu
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList lines="none" style={{ marginTop: "1rem" }}>
          {/* Home */}
          <IonItem button routerLink="/booking" detail={false}>
            <IonIcon icon={homeOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Home</IonLabel>
          </IonItem>

          <IonItem button routerLink="/booking" detail={false}>
            <IonIcon icon={calendarOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Booking</IonLabel>
          </IonItem>

          <IonItem
            button
            detail={false}
            onClick={() => {
              const support = document.getElementById("support");
              if (support) {
                support.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <IonIcon icon={callOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>About us</IonLabel>
          </IonItem>

          <IonItem
            button
            detail={false}
            onClick={() => {
              const support = document.getElementById("support");
              if (support) {
                support.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <IonIcon icon={callOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Contact</IonLabel>
          </IonItem>

          {/* Sign In */}
          <IonItem button routerLink="/login" detail={false}>
            <IonIcon icon={logInOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Sign In</IonLabel>
          </IonItem>
        </IonList>

        <div
          style={{
            marginTop: "2rem",
            textAlign: "center",
            padding: "1rem",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              color: "#888",
            }}
          >
            © 2025 Coop PaBOOKid
          </p>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default RightSideMenu;
