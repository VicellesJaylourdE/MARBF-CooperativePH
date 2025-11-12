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

interface StaffSidebarProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

const Admin_AdminSidebar: React.FC<StaffSidebarProps> = ({ 
  setActiveTab, 
  activeTab 
}) => {

  return (
    <IonMenu contentId="staff-main" type="reveal" side="start"> 
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle style={{ paddingLeft: "16px", fontSize: "1.2rem", fontWeight: "bold" }}>
            ADMIN MENU
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList lines="none"> 
          
          {/* ✅ GI-FIX: Gigamit ang 'color' prop imbes 'selected' 
              Ang 'undefined' kay para mubalik sa default color kung dili active.
          */}
          <IonItem 
            button 
            onClick={() => setActiveTab("dashboard")} 
            color={activeTab === "dashboard" ? "primary" : undefined}
          >
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          <IonItem 
            button 
            onClick={() => setActiveTab("manageusers")}
            color={activeTab === "manageusers" ? "primary" : undefined}
          >
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>Create Users</IonLabel>
          </IonItem>

          <IonItem 
            button 
            onClick={() => setActiveTab("manageequipment")}
            color={activeTab === "manageequipment" ? "primary" : undefined}
          >
            <IonIcon icon={settingsOutline} slot="start" />
            <IonLabel>Manage Equipment</IonLabel>
          </IonItem>

          <IonItem 
            button 
            onClick={() => setActiveTab("managerentalbookings")}
            color={activeTab === "managerentalbookings" ? "primary" : undefined}
          >
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Manage Rental Bookings</IonLabel>
          </IonItem>

          <IonItem 
            button 
            onClick={() => setActiveTab("viewcbookingcalendar")}
            color={activeTab === "viewcbookingcalendar" ? "primary" : undefined}
          >
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>View Booking Calendar</IonLabel>
          </IonItem>

          <IonItem 
            button 
            onClick={() => setActiveTab("viewalltransactions")}
            color={activeTab === "viewalltransactions" ? "primary" : undefined}
          >
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>View all Transactions</IonLabel>
          </IonItem>
          
          <IonItem 
            button 
            onClick={() => setActiveTab("generatereports")}
            color={activeTab === "generatereports" ? "primary" : undefined}
          >
            <IonIcon icon={printOutline} slot="start" />
            <IonLabel>Generate Reports</IonLabel>
          </IonItem>

        </IonList>
      </IonContent>

      {/* ✅ Naa gihapon ni sa ubos para chada */}
      <IonFooter>
        <IonList lines="none">
          <IonItem 
            button 
            onClick={() => setActiveTab("myprofile")}
            color={activeTab === "myprofile" ? "primary" : undefined}
          >
            <IonIcon icon={personCircleOutline} slot="start" /> 
            <IonLabel>My Profile</IonLabel>
          </IonItem>
        </IonList>
      </IonFooter>

    </IonMenu>
  );
};

export default Admin_AdminSidebar;