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
  IonIcon,
} from "@ionic/react";
import {
  homeOutline,
  calendarOutline,
  cashOutline,
  peopleOutline,
  barChartOutline,
  bookOutline,
} from "ionicons/icons";

interface StaffSidebarProps {
  setActiveTab: (tab: string) => void;
}

const Staff_StaffSidebar: React.FC<StaffSidebarProps> = ({ setActiveTab }) => {
  return (
    <IonMenu contentId="staff-main" type="overlay" side="start">
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button onClick={() => setActiveTab("dashboard")}>
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("bookings")}>
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>Booking Management</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("transactions")}>
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>Transactions</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("users")}>
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>View User List</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("monthly revenue")}>
            <IonIcon icon={cashOutline} slot="start" />
            <IonLabel>Monthly Revenue</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("reports")}>
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Reports</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Staff_StaffSidebar;
