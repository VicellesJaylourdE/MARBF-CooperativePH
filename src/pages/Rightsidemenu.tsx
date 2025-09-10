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
      {/* ✅ Header */}
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle style={{ fontWeight: "bold", color: "white" }}>
            Coop PaBOOKid
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* ✅ Content */}
      <IonContent>
        <IonList lines="none" style={{ marginTop: "1rem" }}>
          {/* Home */}
          <IonItem
            button
            routerLink="/"
            detail={false}
            style={{
              margin: "0.5rem",
              background: "#f9f9f9",
          
            }}
          >
            <IonIcon icon={homeOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Home</IonLabel>
          </IonItem>

          {/* Booking */}
          <IonItem
            button
            routerLink="/booking"
            detail={false}
            style={{
              margin: "0.5rem",
              background: "#f9f9f9",
          
            }}
          >
            <IonIcon icon={calendarOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Booking</IonLabel>
          </IonItem>

          {/* About Us */}
          <IonItem
            button
            routerLink="/learnmore"
            detail={false}
            style={{
              margin: "0.5rem",
              background: "#f9f9f9",
           
            }}
          >
            <IonIcon
              icon={informationCircleOutline}
              slot="start"
              color="warning"
            />
            <IonLabel style={{ fontWeight: 500 }}>About Us</IonLabel>
          </IonItem>

          {/* Contact */}
          <IonItem
            button
            routerLink="/contact"
            detail={false}
            style={{
              margin: "0.5rem",
              background: "#f9f9f9",
           
            }}
          >
            <IonIcon icon={callOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500 }}>Contact</IonLabel>
          </IonItem>

          {/* Sign In */}
          <IonItem
            button
            routerLink="/login"
            detail={false}
            style={{
              margin: "0.5rem",
              background: "#FCB53B",
             
            }}
          >
            <IonIcon icon={logInOutline} slot="start" color="warning" />
            <IonLabel style={{ fontWeight: 500, color: "white" }}>
              Sign In
            </IonLabel>
          </IonItem>
        </IonList>

        {/* ✅ Footer */}
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
