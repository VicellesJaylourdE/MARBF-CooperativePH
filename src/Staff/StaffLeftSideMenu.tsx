import React from "react";
import {
  IonMenu,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonLabel,
} from "@ionic/react";

const StaffLeftSideMenu: React.FC = () => {
  return (
    <IonMenu side="start" menuId="staffMenu" contentId="main">
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink="/staff/dashboard">
              <IonLabel>Dashboard</IonLabel>
            </IonItem>
            <IonItem routerLink="/staff/bookings">
              <IonLabel>Booking Management</IonLabel>
            </IonItem>
            <IonItem routerLink="/staff/transactions">
              <IonLabel>Transactions</IonLabel>
            </IonItem>
            <IonItem routerLink="/staff/users">
              <IonLabel>Users</IonLabel>
            </IonItem>
            <IonItem routerLink="/staff/reports">
              <IonLabel>Reports</IonLabel>
            </IonItem>
            <IonItem routerLink="/staff/announcements">
              <IonLabel>Announcements</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default StaffLeftSideMenu;
