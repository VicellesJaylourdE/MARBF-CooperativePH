import React from "react";
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonFooter,
} from "@ionic/react";
import {
  homeOutline,
  calendarOutline,
  peopleOutline,
  barChartOutline,
  bookOutline,
  settingsOutline,
  printOutline,
  personCircleOutline,
} from "ionicons/icons";

// Gi-export ang Interface para magamit sa AdminDashboard
export interface StaffSidebarProps {
  setActiveTab: (tab: string) => void;
  activeTab: string; 
}

const Admin_AdminSidebar: React.FC<StaffSidebarProps> = ({ 
  setActiveTab, 
  activeTab 
}) => {

  return (
    <IonMenu 
      menuId="admin-menu"
      contentId="main-dashboard-content"
      type="overlay" 
      side="start" 
      style={{ "--border": "0px", "--box-shadow": "none" }}
    > 
      <IonContent 
        color="light" 
        style={{
          "--padding-start": "8px", 
          "--padding-end": "8px",
          "--padding-top": "20px" 
        }}
      >
        <IonList lines="none"> 
          
          <IonItem button onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("manageusers")} className={activeTab === "manageusers" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>Create Users</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("manageequipment")} className={activeTab === "manageequipment" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={settingsOutline} slot="start" />
            <IonLabel>Manage Equipment</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("managerentalbookings")} className={activeTab === "managerentalbookings" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Manage Rental Bookings</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("viewcbookingcalendar")} className={activeTab === "viewcbookingcalendar" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>View Booking Calendar</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("viewalltransactions")} className={activeTab === "viewalltransactions" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>View all Transactions</IonLabel>
          </IonItem>
          
          <IonItem button onClick={() => setActiveTab("generatereports")} className={activeTab === "generatereports" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={printOutline} slot="start" />
            <IonLabel>Generate Reports</IonLabel>
          </IonItem>

        </IonList>
      </IonContent>

      <IonFooter class="ion-no-border" color="light">
        <IonList lines="none" style={{"--padding-start": "8px", "--padding-end": "8px"}}>
          <IonItem button onClick={() => setActiveTab("myprofile")} className={activeTab === "myprofile" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={personCircleOutline} slot="start" /> 
            <IonLabel>My Profile</IonLabel>
          </IonItem>
        </IonList>
      </IonFooter>

    </IonMenu>
  );
};

export default Admin_AdminSidebar;