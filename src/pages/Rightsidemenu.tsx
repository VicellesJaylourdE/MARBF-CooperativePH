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
} from "@ionic/react";

const RightSideMenu: React.FC = () => {
  return (
    <IonMenu side="end" contentId="main" type="overlay" className="ion-hide-md-up">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem routerLink="/booking">
            <IonLabel>Booking</IonLabel>
          </IonItem>
          <IonItem routerLink="/about">
            <IonLabel>About Us</IonLabel>
          </IonItem>
          <IonItem routerLink="/contact">
            <IonLabel>Contact</IonLabel>
          </IonItem>
          <IonItem routerLink="/login">
            <IonLabel>Sign In</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default RightSideMenu;
