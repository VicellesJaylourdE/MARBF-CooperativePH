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
           <IonItem button onClick={() => setActiveTab("registermembers")}>
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Register Members</IonLabel>
          </IonItem>
           <IonItem button onClick={() => setActiveTab("manageequipment")}>
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>Manage Equipment</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("viewcbookingcalendar")}>
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>View Booking Calendar</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("managerentalbookings")}>
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>Manage Rental Bookings</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("viewalltransactions")}>
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>View all Transactions</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("manageusers")}>
            <IonIcon icon={cashOutline} slot="start" />
            <IonLabel>Manage users</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("generatereports")}>
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Generate reports</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("users")}>
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>View User List</IonLabel>
          </IonItem>
           <IonItem button onClick={() => setActiveTab("latereturnpenalty")}>
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>Late Return Penalty</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Staff_StaffSidebar;
