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
  gridOutline,
  printOutline,
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
           <IonItem button onClick={() => setActiveTab("managerentalbookings")}>
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>ManageRentalBookings</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("viewbookingcalendar")}>
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>ViewBookingCalendar</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("viewalltransactions")}>
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>View All Transactions</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("users")}>
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>View User List</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setActiveTab("latereturnpenalty")}>
            <IonIcon icon={gridOutline} slot="start" />
            <IonLabel>LateReturnPenalty</IonLabel>
          </IonItem>
             <IonItem button onClick={() => setActiveTab("generatereports")}>
            <IonIcon icon={printOutline} slot="start" />
            <IonLabel>GenerateReports</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Staff_StaffSidebar;
