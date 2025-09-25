import React from "react";
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";

import StaffHeaderBar from "../components/Staff_StaffHeader";

const StaffDashboard: React.FC = () => {
  return (
    <IonPage id="main">
      {/* Header */}
      <StaffHeaderBar />

      {/* Dashboard Content */}
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Today’s Bookings</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>0</IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Total Rentals</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>0</IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Revenue Highlights</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>P0.00</IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default StaffDashboard;
