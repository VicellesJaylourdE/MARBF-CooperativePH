import React, { useState } from "react";
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
  IonButton,
  IonButtons,
} from "@ionic/react";
import {
  homeOutline,
  calendarOutline,
  cashOutline,
  peopleOutline,
  barChartOutline,
  bookOutline,
  chevronUpOutline,
  chevronDownOutline,
  menuOutline,
  backspaceOutline,
} from "ionicons/icons";

interface StaffSidebarProps {
  setActiveTab: (tab: string) => void;
}

const Admin_AdminSidebar: React.FC<StaffSidebarProps> = ({ setActiveTab }) => {
  const [showInventory, setShowInventory] = useState(false);

  return (
    <IonMenu contentId="staff-main" type="overlay" side="start">
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle
            style={{
              fontWeight: 600,
              fontSize: "1.2rem",
              color: "#ffffffff",
            }}
          >
            Admin Panel
          </IonTitle>

          <IonButtons slot="end">
            <IonButton
              fill="clear"
              color="medium"
              onClick={() => {
                const menu = document.querySelector("ion-menu");
                if (menu) (menu as any).close();
              }}
            >
              <IonIcon icon={backspaceOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem button onClick={() => setActiveTab("dashboard")}>
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("manageusers")}>
            <IonIcon icon={cashOutline} slot="start" />
            <IonLabel>Manage Users</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setShowInventory(!showInventory)}>
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>Inventory</IonLabel>
            <IonIcon
              icon={showInventory ? chevronUpOutline : chevronDownOutline}
              slot="end"
            />
          </IonItem>

          {showInventory && (
            <div style={{ marginLeft: "2.5rem", marginTop: "0.3rem" }}>
              <IonItem
                button
                lines="none"
                onClick={() => setActiveTab("admindashboardanaltys")}
              >
                <IonLabel>Dashboard</IonLabel>
              </IonItem>
              <IonItem
                button
                lines="none"
                onClick={() => setActiveTab("manageequipment")}
              >
                <IonLabel>Manage Equipment</IonLabel>
              </IonItem>
              <IonItem
                button
                lines="none"
                onClick={() => setActiveTab("managerentalbookings")}
              >
                <IonLabel>Manage Rental Bookings</IonLabel>
              </IonItem>
              <IonItem
                button
                lines="none"
                onClick={() => setActiveTab("addequipment")}
              >
                <IonLabel>Add Equipment</IonLabel>
              </IonItem>
            </div>
          )}

          <IonItem button onClick={() => setActiveTab("viewcbookingcalendar")}>
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>View Booking Calendar</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("viewalltransactions")}>
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>View all Transactions</IonLabel>
          </IonItem>

         

          <IonItem button onClick={() => setActiveTab("generatereports")}>
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Generate Reports</IonLabel>
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

export default Admin_AdminSidebar;
