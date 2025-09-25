import React, { useState } from "react";
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
  IonSplitPane,
} from "@ionic/react";

import StaffHeaderBar from "../components/Staff_StaffHeader";
import StaffSidebar from "../components/Staff_StaffSidebar";

const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
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
        );
      case "bookings":
        return (
          <IonContent className="ion-padding">
            <h2>Booking Management</h2>
            <p>View and manage rental bookings here.</p>
          </IonContent>
        );
      case "transactions":
        return (
          <IonContent className="ion-padding">
            <h2>Transactions</h2>
            <p>View transactions from farmers.</p>
          </IonContent>
        );
      case "users":
        return (
          <IonContent className="ion-padding">
            <h2>Users</h2>
            <p>View registered farmers list.</p>
          </IonContent>
        );
      case "reports":
        return (
          <IonContent className="ion-padding">
            <h2>Reports</h2>
            <p>Generate rental data and financial summaries.</p>
          </IonContent>
        );
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonSplitPane contentId="staff-main">
        {/* Sidebar Component */}
        <StaffSidebar setActiveTab={setActiveTab} />

        {/* Main Content */}
        <IonPage id="staff-main">
          {/* StaffHeaderBar is the only header now */}
          <StaffHeaderBar />
          {renderContent()}
        </IonPage>
      </IonSplitPane>
    </IonPage>
  );
};

export default StaffDashboard;
