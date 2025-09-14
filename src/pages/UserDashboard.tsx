import { IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel } from "@ionic/react";
import { useState, useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import HeaderBar from "../components/HeaderBar";
import StatsGrid from "../components/StatsGrid";
import EquipmentCatalog from "../components/EquipmentCatalog";
import Bookings from "../components/Bookings";
import CalendarView from "../components/CalendarView";
import "../theme/UserDashboard.css";

const UserDashboard: React.FC = () => {
  const [segment, setSegment] = useState("catalog");

  useEffect(() => {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token: " + token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error: ", error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      alert(`New Notification: ${notification.title}\n${notification.body}`);
    });
  }, []);

  return (
    <IonPage>
      <HeaderBar />
      <IonContent fullscreen>
        <StatsGrid totalEquipment={6} availableNow={6} pendingBookings={3} activeRentals={0} />

        <IonSegment value={segment} onIonChange={(e) => setSegment(String(e.detail.value))}>
          <IonSegmentButton value="catalog">
            <IonLabel>Equipment Catalog</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="bookings">
            <IonLabel>My Bookings</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="calendar">
            <IonLabel>Calendar</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {segment === "catalog" && <EquipmentCatalog />}
        {segment === "bookings" && <Bookings />}
        {segment === "calendar" && <CalendarView />}
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;
