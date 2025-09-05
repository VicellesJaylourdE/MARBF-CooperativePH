import React from "react";
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonMenuToggle,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
} from "@ionic/react";
import {
  calendarOutline,
  informationCircleOutline,
  callOutline,
  logInOutline,
  personAddOutline,
} from "ionicons/icons";

const SideMenu: React.FC = () => {
  return (
    <IonMenu
      side="start"
      menuId="mainMenu"
      contentId="mainContent"
      className="ion-hide-sm-up"
      type="overlay"
    >
      {/* ✅ Header */}
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            🚜 Coop PaBOOKid
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* ✅ Menu Content */}
      <IonContent>
        <IonList lines="full" style={{ marginTop: "0.5rem" }}>
          <IonMenuToggle autoHide={true}>
            <IonItem button routerLink="/booking" detail={false}>
              <IonIcon icon={calendarOutline} slot="start" color="success" />
              <IonLabel>Booking</IonLabel>
            </IonItem>

            <IonItem button routerLink="/about" detail={false}>
              <IonIcon
                icon={informationCircleOutline}
                slot="start"
                color="success"
              />
              <IonLabel>About Us</IonLabel>
            </IonItem>

            <IonItem button routerLink="/contact" detail={false}>
              <IonIcon icon={callOutline} slot="start" color="success" />
              <IonLabel>Contact</IonLabel>
            </IonItem>

            <IonItem button routerLink="/login" detail={false}>
              <IonIcon icon={logInOutline} slot="start" color="success" />
              <IonLabel>Sign In</IonLabel>
            </IonItem>

            <IonItem button routerLink="/register" detail={false}>
              <IonIcon icon={personAddOutline} slot="start" color="success" />
              <IonLabel>Get Started</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>

        {/* ✅ Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            fontSize: "0.8rem",
            color: "#666",
            borderTop: "1px solid #ddd",
            marginTop: "auto",
          }}
        >
          <p style={{ margin: 0 }}>
            © 2025 Coop PaBOOKid <br />
            All rights reserved.
          </p>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default SideMenu;