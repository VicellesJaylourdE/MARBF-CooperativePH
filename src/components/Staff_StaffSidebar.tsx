import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonMenu,
} from "@ionic/react";

interface StaffSidebarProps {
  setActiveTab: (tab: string) => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ setActiveTab }) => {
  return (
    <IonMenu contentId="staff-main" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Staff Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button onClick={() => setActiveTab("dashboard")}>
            <IonLabel>Dashboard</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("bookings")}>
            <IonLabel>Booking Management</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("transactions")}>
            <IonLabel>Transactions</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("users")}>
            <IonLabel>Users</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("reports")}>
            <IonLabel>Reports</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default StaffSidebar;
